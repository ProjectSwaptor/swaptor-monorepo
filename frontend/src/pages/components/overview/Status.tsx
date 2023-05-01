type StatusProps = {
  active: boolean;
};

const Status = ({ active }: StatusProps) => {
  return (
    <div
      className={
        active
          ? "bg-green-900 bg-opacity-60 text-green-400 rounded-3xl w-24 md:w-32 text-center py-2 2xl:mx-7"
          : "bg-red-900 bg-opacity-50 text-opacity-80 text-red-500 rounded-3xl w-24 md:w-32 text-center py-2 2xl:mx-7"
      }
    >
      {active ? "Active" : "Inactive"}
    </div>
  );
};

export default Status;
