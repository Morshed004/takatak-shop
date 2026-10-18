export type InvoiceOrder = {
  id: string;
  placedAt: string;
  payment: string;
  customer: { name: string; phone: string };
  address: string;
  items: { name: string; variant: string; qty: number; price: number }[];
  discount: number;
  shipping: number;
};

/* ---- Store info: নিজের দোকানের তথ্য দিন ---- */
const STORE = {
  name: "Takatak",
  email: "support@yourshop.com",
  web: "www.yourshop.com",
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

/**
 * স্ক্রিনে লুকানো থাকে, শুধু প্রিন্ট করার সময় দেখায়।
 * Page এর বাকি অংশে `print:hidden` দিতে হবে।
 */
export function Invoice({ order }: { order: InvoiceOrder }) {
  const subtotal = order.items.reduce((s, x) => s + x.price * x.qty, 0);
  const total = subtotal - order.discount + order.shipping;
  const isCod = order.payment.includes("ক্যাশ");

  return (
    <section
      id="invoice"
      aria-hidden
      className="mx-auto hidden w-full max-w-198.5 bg-white p-0 text-[13px] leading-relaxed text-black print:block"
    >
      {/* A4 size + margin, প্রিন্টে ব্যাকগ্রাউন্ড রং ঠিক রাখা */}
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          html, body { background: #fff !important; }
          #invoice { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #invoice tr, #invoice .avoid-break { break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <header className="flex items-start justify-between border-b-2 border-black pb-5">
        <div>
          <p className="text-3xl font-bold">{STORE.name}</p>
          <p className="text-gray-700">{STORE.email} · {STORE.web}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-wide">ইনভয়েস</p>
          <p className="mt-2 text-gray-700">ইনভয়েস নং: <span className="font-semibold text-black">{order.id}</span></p>
          <p className="text-gray-700">তারিখ: {order.placedAt}</p>
          <p className="mt-2 inline-block rounded border border-black px-2 py-0.5 text-xs font-semibold">
            {isCod ? "পরিশোধ বাকি (COD)" : "পরিশোধিত"}
          </p>
        </div>
      </header>

      {/* Customer + payment */}
      <div className="avoid-break mt-6 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold text-gray-600">বিল ও ডেলিভারি ঠিকানা</p>
          <p className="mt-1 font-semibold">{order.customer.name}</p>
          <p>{order.customer.phone}</p>
          <p className="text-gray-700">{order.address}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600">পেমেন্ট পদ্ধতি</p>
          <p className="mt-1 font-semibold">{order.payment}</p>
          {isCod && <p className="text-gray-700">পণ্য হাতে পেয়ে {taka(total)} পরিশোধ করুন</p>}
        </div>
      </div>

      {/* Items */}
      <table className="mt-7 w-full border-collapse">
        <thead>
          <tr className="border-y-2 border-black bg-gray-100 text-left">
            <th className="w-10 px-2 py-2">#</th>
            <th className="px-2 py-2">পণ্যের বিবরণ</th>
            <th className="px-2 py-2 text-right">একক মূল্য</th>
            <th className="px-2 py-2 text-center">পরিমাণ</th>
            <th className="px-2 py-2 text-right">মোট</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it, i) => (
            <tr key={it.name} className="border-b border-gray-300">
              <td className="px-2 py-3 align-top">{bn(i + 1)}</td>
              <td className="px-2 py-3">
                <p className="font-medium">{it.name}</p>
                <p className="text-xs text-gray-600">{it.variant}</p>
              </td>
              <td className="px-2 py-3 text-right align-top">{taka(it.price)}</td>
              <td className="px-2 py-3 text-center align-top">{bn(it.qty)}</td>
              <td className="px-2 py-3 text-right align-top font-medium">{taka(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="avoid-break mt-5 flex justify-end">
        <dl className="w-72 space-y-1.5">
          <div className="flex justify-between"><dt className="text-gray-700">সাবটোটাল</dt><dd>{taka(subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt className="text-gray-700">কুপন ছাড়</dt><dd>-{taka(order.discount)}</dd></div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-700">ডেলিভারি চার্জ</dt>
            <dd>{order.shipping === 0 ? "ফ্রি" : taka(order.shipping)}</dd>
          </div>
          <div className="flex justify-between border-t-2 border-black pt-2 text-base font-bold">
            <dt>সর্বমোট</dt><dd>{taka(total)}</dd>
          </div>
          {isCod && (
            <div className="flex justify-between font-semibold"><dt>প্রদেয় (COD)</dt><dd>{taka(total)}</dd></div>
          )}
        </dl>
      </div>

      {/* Footer */}
      <footer className="avoid-break mt-12 border-t border-gray-300 pt-5 text-xs text-gray-700">
        <p className="font-semibold text-black">শর্তাবলী</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে অব্যবহৃত অবস্থায় রিটার্ন করা যাবে।</li>
          <li>ডেলিভারির সময় পণ্য দেখে ও যাচাই করে গ্রহণ করুন।</li>
        </ul>
        <p className="mt-6 text-center text-sm text-black">আমাদের উপর আস্থা রাখার জন্য ধন্যবাদ!</p>
        <p className="mt-1 text-center">এটি কম্পিউটার জেনারেটেড ইনভয়েস, স্বাক্ষরের প্রয়োজন নেই।</p>
      </footer>
    </section>
  );
}