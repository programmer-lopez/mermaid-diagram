import {
    Component,
    signal,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    HostListener,
    inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import mermaid from 'mermaid';
import panzoom, { PanZoom } from 'panzoom';
import { UrlStorageService } from './url-storage.service';

// ─── Default diagram shown on first load ───────────────────────────────────
const DEFAULT_DIAGRAM = `
sequenceDiagram
    autonumber
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts<br/>prevail...
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!

`;

// ─── Types ──────────────────────────────────────────────────────────────────
interface SequenceElement { number: number; rect: DOMRect; }

@Component({
    selector: 'app-root',
    imports: [FormsModule],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {

    // ─── Services ───────────────────────────────────────────────────────────
    private readonly urlStorage = inject(UrlStorageService);

    // ─── Template refs ──────────────────────────────────────────────────────
    @ViewChild('inputDialog') private dialogRef!: ElementRef<HTMLDialogElement>;

    // ─── Public state (bound to template) ───────────────────────────────────
    mermaidCode       = DEFAULT_DIAGRAM;
    errorMessage      = signal<string | null>(null);
    isSequenceDiagram = signal(false);
    currentStep       = signal(0);
    totalSteps        = signal(0);
    hasRendered       = signal(false);
    isDialogOpen      = signal(false);

    // ─── Private state ──────────────────────────────────────────────────────
    private pan?: PanZoom;
    private seqElements: SequenceElement[] = [];
    private viewBoxSize = { width: 0, height: 0 };

    // ─── Lifecycle ──────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        // Initialize mermaid once — not on every render call
        mermaid.initialize({ startOnLoad: false, sequence: { showSequenceNumbers: true } });

        const savedText = await this.urlStorage.getText();
        const savedStep = this.urlStorage.get('sequence-number');

        if (savedText) {
            this.mermaidCode = savedText;
            await this.render(savedText);
            if (savedStep) this.moveTo(Number(savedStep));
        } else {
            await this.render(DEFAULT_DIAGRAM);
            setTimeout(() => this.openEditor(), 100); // show editor on first load
        }
    }

    ngOnDestroy(): void {
        this.pan?.dispose();
    }

    // ─── Resize: recalculate sequence rects when viewport changes ───────────
    @HostListener('window:resize')
    onWindowResize(): void {
        if (this.isSequenceDiagram()) this.recalculateSequenceRects();
    }

    // ─── Render ─────────────────────────────────────────────────────────────
    async render(text: string): Promise<void> {
        if (!text?.trim()) return;

        this.errorMessage.set(null);
        this.pan?.dispose();
        this.pan = undefined;

        const graphDiv = document.getElementById('graphDiv');
        if (!graphDiv) return;

        // Remove stale SVG before re-rendering — mermaid fails silently if the same id exists
        graphDiv.innerHTML = '';
        document.getElementById('mySvgId')?.remove();

        try {
            const { svg, bindFunctions } = await mermaid.render('mySvgId', text);
            graphDiv.innerHTML = svg.replace(/[ ]*max-width:[ 0-9.]*px;/i, '');
            bindFunctions?.(graphDiv);
            this.hasRendered.set(true);
        } catch (err: any) {
            this.errorMessage.set(err?.message ?? 'Render error');
            setTimeout(() => this.errorMessage.set(null), 5000);
            return;
        }

        this.pan = panzoom(graphDiv);

        // Small delay so the SVG is fully laid out before reading BoundingClientRects
        await new Promise<void>(r => setTimeout(r, 200));
        this.setupSequenceController(text);
    }

    // ─── Sequence controller ────────────────────────────────────────────────
    private setupSequenceController(text: string): void {
        const isSeq = text.includes('sequenceDiagram');
        this.isSequenceDiagram.set(isSeq);
        this.currentStep.set(0);

        if (!isSeq) { this.seqElements = []; return; }

        const vb = document.querySelector('#graphDiv svg')
            ?.getAttribute('viewBox')?.split(' ').map(Number);
        this.viewBoxSize = { width: vb?.[2] ?? 0, height: vb?.[3] ?? 0 };

        this.recalculateSequenceRects();
    }

    private recalculateSequenceRects(): void {
        this.seqElements = Array.from(
            document.querySelectorAll('#graphDiv .sequenceNumber')
        ).map(el => ({ number: Number(el.textContent), rect: el.getBoundingClientRect() }));
        this.totalSteps.set(this.seqElements.length);
    }

    // ─── Navigation ─────────────────────────────────────────────────────────
    moveNext(): void {
        this.moveTo(Math.min(this.currentStep() + 1, this.totalSteps()));
    }

    movePrev(): void {
        const prev = Math.max(this.currentStep() - 1, 0);
        if (prev === 0) {
            this.pan?.smoothZoomAbs(0, 0, 1);
            this.currentStep.set(0);
            this.urlStorage.set('sequence-number', '0');
            return;
        }
        this.moveTo(prev);
    }

    moveTo(step: number): void {
        const el = this.seqElements.find(e => e.number === step);
        if (!el) return;
        this.panTo(el);
        this.currentStep.set(step);
        this.urlStorage.set('sequence-number', String(step));
    }

    onSliderChange(event: Event): void {
        this.moveTo(Number((event.target as HTMLInputElement).value));
    }

    private panTo({ rect }: SequenceElement): void {
        if (!this.pan) return;

        const padBlock  = Math.max(100, Math.min(600, -rect.height / 5 + 700));
        const padInline = Math.max(100, Math.min(600, -this.viewBoxSize.width / 5 + 700));

        this.pan.smoothShowRectangle(
            {
                left:   rect.left   - padInline,
                top:    rect.top    - padBlock,
                right:  rect.right  + padInline,
                bottom: rect.bottom + padBlock,
                width:  rect.width  + padInline * 2,
                height: rect.height + padBlock  * 2,
                x: rect.x, y: rect.y,
                toJSON: () => rect.toJSON()
            },
            (from, to) => {
                const dist = Math.sqrt(
                    (from.top    - to.top)    ** 2 + (from.right  - to.right)  ** 2 +
                    (from.bottom - to.bottom) ** 2 + (from.left   - to.left)   ** 2
                );
                const e = Math.exp(dist / 1000);
                return (e * 1000) / (e + 1);
            }
        );
    }

    // ─── Dialog ─────────────────────────────────────────────────────────────
    openEditor(): void {
        this.isDialogOpen.set(true);
        this.dialogRef?.nativeElement.showModal();
    }

    closeEditor(): void {
        this.isDialogOpen.set(false);
        this.dialogRef?.nativeElement.close();
    }

    onDialogBackdropClick(event: MouseEvent): void {
        const r = this.dialogRef?.nativeElement.getBoundingClientRect();
        if (!r) return;
        if (event.clientX < r.left || event.clientX > r.right ||
            event.clientY < r.top  || event.clientY > r.bottom) {
            this.closeEditor();
        }
    }

    async renderAndClose(): Promise<void> {
        this.closeEditor();
        await this.render(this.mermaidCode);
        await this.urlStorage.setText(this.mermaidCode);
    }
}
