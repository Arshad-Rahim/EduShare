import { httpServer } from "./app";

const PORT = process.env.PORT||3000; // Match frontend's Socket.IO URL

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
