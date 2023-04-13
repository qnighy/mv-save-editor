import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { JsonEditor } from './JsonEditor';

type WrapperProps = {
  defaultValue: unknown;
};
const Wrapper: React.FC<WrapperProps> = (props) => {
  const { defaultValue } = props;
  const [value, setValue] = useState(defaultValue);
  return <JsonEditor value={value} setValue={setValue} />;
};

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: 'JsonEditor',
  component: Wrapper,
  tags: ['autodocs'],
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Primary: Story = {
  args: {
    defaultValue: {
      stringValue: "foobar",
      numericValue: 42,
      arrayValue: [1, 2, 3],
      booleanValue: true,
      nullValue: null,
      nestedObject: {
        foo: 42,
        bar: 100,
      },
    },
  },
};
