import { Mail, MessageCircle, Phone } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-brand text-brand-foreground">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] sm:gap-x-6 sm:px-4 sm:text-[10px] sm:tracking-[0.2em] lg:px-6">
        <a
          href="tel:+254111040400"
          className="inline-flex min-w-0 items-center gap-1.5 text-black/80 transition-colors hover:text-black"
        >
          <Phone className="h-3 w-3" strokeWidth={2} />
          Call: 0111 040 400
        </a>
        <span className="hidden h-3 w-px bg-black/25 sm:inline-block" aria-hidden />
        <a
          href="https://wa.me/254792792750"
          target="_blank"
          rel="noopener"
          className="inline-flex min-w-0 items-center gap-1.5 text-black/80 transition-colors hover:text-black"
        >
          <MessageCircle className="h-3 w-3" strokeWidth={2} />
          WhatsApp: 0792 792 750
        </a>
        <span className="hidden h-3 w-px bg-black/25 sm:inline-block" aria-hidden />
        <a
          href="mailto:sales@blacktonertechnologies.co.ke"
          className="inline-flex min-w-0 max-w-full items-center gap-1.5 break-all text-black/80 transition-colors hover:text-black sm:break-normal"
        >
          <Mail className="h-3 w-3" strokeWidth={2} />
          sales@blacktonertechnologies.co.ke
        </a>
      </div>
    </div>
  );
}
