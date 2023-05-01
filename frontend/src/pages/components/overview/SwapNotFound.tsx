import Link from "next/link";

const SwapNotFound = () => (
  <div className="flex flex-col w-full overflow-hidden h-[50rem]">
    <div className="flex my-10">
      <h1 className="text-[2rem] font-bold relative top-20 mx-auto">
        Swap not found.
      </h1>
    </div>
    <div className="flex items-center justify-center relative top-16">
      <Link href="/">
        <button className="btn-secondary h-12 w-56">Return to Home Page</button>
      </Link>
    </div>
  </div>
);

export default SwapNotFound;
