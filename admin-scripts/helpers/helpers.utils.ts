import { ExitCode } from "../constants/constants.swaptor";

enum MessageType {
  Start,
  Success,
  Error,
}

type InfoMessages = {
  startMessage?: string;
  successMessage?: string;
  errorMessage?: string;
};

export class MessageLogger {
  constructor(private messages: InfoMessages) {}

  log(message: MessageType) {
    switch (message) {
      case MessageType.Error:
        if (this.messages.errorMessage) {
          console.log(this.messages.errorMessage);
        }
        break;
      case MessageType.Start:
        if (this.messages.startMessage) {
          console.log(this.messages.startMessage);
        }
        break;
      case MessageType.Success:
        if (this.messages.successMessage) {
          console.log(this.messages.successMessage);
        }
        break;
    }
  }
}

export const tryCatchFail = async <G>(
  handler: () => Promise<G>,
  messageLogger: MessageLogger
) => {
  try {
    messageLogger.log(MessageType.Start);
    await handler();
    messageLogger.log(MessageType.Success);
  } catch (e) {
    messageLogger.log(MessageType.Error);

    if (e instanceof Error) {
      console.log("Error message: ", e.message);
    }

    process.exit(ExitCode.FAIL);
  }
};
