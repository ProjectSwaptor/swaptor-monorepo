type InputContainerProps = {
  children: React.ReactNode;
};

const InputContainer = ({ children }: InputContainerProps) => (
  <div
    className="flex flex-col space-y-4 items-start bg-gray-900 w-full border-transparent
                  rounded-lg border-b-[2px] p-4 focus-within:border-b[2px] focus-within:border-gray-700"
    spellCheck="false"
    autoCorrect="false"
    autoCapitalize="false"
    tabIndex={-1}
  >
    {children}
  </div>
);

export default InputContainer;
