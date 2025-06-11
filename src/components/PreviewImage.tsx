interface PreviewImageProps {
  imageBuffer: Buffer;
  alt: string;
  className?: string;
}

export function PreviewImage({ imageBuffer, alt, className = "" }: PreviewImageProps) {
  return (
    <div className={`aspect-square ${className}`}>
      <img
        src={`data:image/jpeg;base64,${imageBuffer.toString('base64')}`}
        alt={alt}
        className="w-full h-full object-cover rounded-lg shadow-md"
      />
    </div>
  );
}