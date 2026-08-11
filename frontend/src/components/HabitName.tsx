interface Props {
  name: string;
  as?: 'h3' | 'p';
  className?: string;
}

export default function HabitName({ name, as: Tag = 'h3', className = '' }: Props) {
  return (
    <Tag className={`habit-name ${className}`} title={name}>
      {name}
    </Tag>
  );
}
