type TogglerIconProps = {
  active: boolean;
};

const TogglerIcon = ({ active }: TogglerIconProps) => {
  return (
    <div
      className={`${
        active ? "bg-teal-600" : "bg-slate-600"
      } transition-all ease-in duration-150 flex items-center h-[1.5rem] w-[3rem] rounded-full`}
    >
      <div
        className={`${
          active ? "bg-teal-200 ml-[1.6rem]" : "bg-slate-400 ml-[0.1rem]"
        } transition-[margin] ease-in duration-150 relative h-[1.3rem] w-[1.3rem] rounded-full`}
      />
    </div>
  );
};

export default TogglerIcon;
