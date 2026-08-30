import { useState, useRef, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { Send, Plus, X, Image, FileText } from 'lucide-react';
import './ChatInput.css';

export interface ChatAttachment {
  name: string;
  type: string;
  url: string;
  base64?: string;
  mimeType?: string;
}

interface ChatInputProps {
  onSend: (message: string, attachment?: ChatAttachment) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url,
        base64: base64Data,
        mimeType: file.type || 'image/jpeg',
      });
    };

    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || disabled) return;
    onSend(trimmed || (attachment ? `Sent attachment: ${attachment.name}` : ''), attachment || undefined);
    setValue('');
    setAttachment(null);
    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [value]);

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        {/* Attachment Preview Badge */}
        {attachment && (
          <div className="chat-attachment-preview">
            {attachment.type === 'image' ? <Image size={14} /> : <FileText size={14} />}
            <span className="chat-attachment-name">{attachment.name}</span>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm chat-attachment-remove"
              onClick={() => setAttachment(null)}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Gemini-Style Popover Menu for + Button */}
        {showAttachMenu && (
          <div className="gemini-attach-popover animate-slide-up">
            <button
              type="button"
              className="attach-popover-item"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                }
              }}
            >
              <Image size={16} className="attach-icon-img" />
              <span>Upload Image / Pet Photo</span>
            </button>
            <button
              type="button"
              className="attach-popover-item"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = '.pdf,.doc,.docx,.txt';
                  fileInputRef.current.click();
                }
              }}
            >
              <FileText size={16} className="attach-icon-doc" />
              <span>Upload Vet Document</span>
            </button>
          </div>
        )}

        <form className="chat-input" onSubmit={handleSubmit} id="chat-input-form">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
          />

          {/* Gemini Circle + Button */}
          <button
            type="button"
            className={`gemini-plus-btn ${showAttachMenu ? 'gemini-plus-btn--active' : ''}`}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            disabled={disabled}
            title="Upload image or file"
            id="chat-attach-button"
          >
            <Plus size={18} />
          </button>

          {/* Text Area (Auto-expanding) */}
          <textarea
            ref={textareaRef}
            className="chat-input__field input"
            placeholder="Ask PetSOS assistant..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            id="chat-input-field"
            rows={1}
          />

          {/* Send Button */}
          <button
            type="submit"
            className="chat-input__send btn btn-primary btn-icon"
            disabled={disabled || (!value.trim() && !attachment)}
            aria-label="Send message"
            id="chat-send-button"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
