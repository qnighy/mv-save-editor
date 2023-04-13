import { describe, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { composeStory } from "@storybook/testing-react";
import meta, { Primary } from "./JsonEditor.stories";

describe("JsonEditor", () => {
  it("allows editing booleans", async () => {
    const Story = composeStory(Primary, meta);
    render(<Story />);
    await userEvent.click(screen.getByText(/true/));
    expect(screen.getByText(/false/)).toBeInTheDocument();
  });
});
