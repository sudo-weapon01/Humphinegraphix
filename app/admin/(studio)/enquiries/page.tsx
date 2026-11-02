import { listQuoteRequests } from "@/lib/enquiries";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEnquiriesPage() {
  const enquiries = await listQuoteRequests(100);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
          Quote requests
        </h1>
        <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-brand-muted">
          Read-only list of requests from the contact form. Reply to the sender by email and quote
          them directly — nothing here takes payment or creates an order.
        </p>
      </header>

      {enquiries.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-brand-line bg-brand-surface p-8 text-center text-sm text-brand-muted">
          No quote requests yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-brand-line bg-brand-surface">
          <table className="w-full min-w-[54rem] border-collapse text-left text-[0.82rem]">
            <caption className="sr-only">Quote requests, newest first</caption>
            <thead>
              <tr className="border-b border-brand-line bg-brand-paper-deep/60 text-[0.7rem] uppercase tracking-[0.1em] text-brand-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Received</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Flyer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Dates</th>
                <th scope="col" className="px-4 py-3 font-semibold">Budget range</th>
                <th scope="col" className="px-4 py-3 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-b border-brand-line/70 last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-brand-muted">
                    {formatDate(enquiry.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-primary">{enquiry.name}</p>
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="text-brand-accent-strong hover:underline"
                    >
                      {enquiry.email}
                    </a>
                    {enquiry.phone ? (
                      <p className="text-brand-muted">{enquiry.phone}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-brand-primary">{enquiry.flyerType}</td>
                  <td className="px-4 py-3 text-brand-muted">
                    {enquiry.eventDate ? <p>Event: {enquiry.eventDate}</p> : null}
                    {enquiry.deadline ? <p>Deadline: {enquiry.deadline}</p> : null}
                    {!enquiry.eventDate && !enquiry.deadline ? "—" : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-primary">
                    {enquiry.budgetRange}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-brand-muted">{enquiry.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
