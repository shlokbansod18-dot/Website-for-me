import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="numeric font-display text-[7rem] leading-none text-accent">
          404
        </p>
        <h1 className="display-2 mt-4">Nothing lives here</h1>
        <p className="mx-auto mt-5 max-w-sm text-ink-2">
          The page you were after has moved, been unpublished, or never existed. It happens.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" size="lg">
            Browse the shop
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Back to the start
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
