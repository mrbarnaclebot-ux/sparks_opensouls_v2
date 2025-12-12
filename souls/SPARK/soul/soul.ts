import { Soul, load } from "@opensouls/engine";

const soul: Soul = {
  name: "SPARK",
  attributes: {
    avatarUrl: "/spark-icon.png"
  },
  staticMemories: {
    core: load("./staticMemories/core.md")
  }
}

export default soul
