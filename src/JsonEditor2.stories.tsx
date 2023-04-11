import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { JsonEditor2 } from './JsonEditor2';

type WrapperProps = {
  defaultValue: unknown;
};
const Wrapper: React.FC<WrapperProps> = (props) => {
  const { defaultValue } = props;
  const [value, setValue] = useState(defaultValue);
  return <JsonEditor2 value={value} setValue={setValue} />;
};

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: 'JsonEditor2',
  component: Wrapper,
  tags: ['autodocs'],
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Primary: Story = {
  args: {
    defaultValue: {
      foo: 42,
      bar: [1, 2, 3],
    },
  },
};
