export default function CheckoutCancel() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold">Payment cancelled</h1>
        <p className="mt-2">No charge was made. You can try again.</p>
      </div>
    </div>
  );
}