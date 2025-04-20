import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function SkillsInput({
  value,
  onChange,
  placeholder = 'Type a skill and press space or comma',
  className,
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === ' ' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!value.includes(newSkill)) {
        onChange([...value, newSkill]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((skill) => (
        <div
          key={skill}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-secondary rounded-md"
        >
          <span>{skill}</span>
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none"
      />
    </div>
  );
}
