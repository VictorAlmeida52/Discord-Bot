import { BotEvent } from "../types";
import { Queue } from "distube";

const event: BotEvent = {
  name: "initQueue",
  distube: true,
  execute: async (queue: Queue) => {
    queue.autoplay = true;
    queue.volume = 100;
  },
};

export default event;
