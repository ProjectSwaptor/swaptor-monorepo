import Link from "next/link";

const NotFound = () => {
  return (
    <div className="bg-gray-900 h-screen w-screen flex flex-col items-center justify-center align-center">
      <h1 className="text-[2.5rem] font-bold mb-4">Page not found.</h1>
      <button className="btn-primary">
        <Link href="/"> Return to Homepage</Link>
      </button>
    </div>
  );
};

export default NotFound;
