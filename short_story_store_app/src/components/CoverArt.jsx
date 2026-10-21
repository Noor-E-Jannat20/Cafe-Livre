// Shows a story's uploaded cover, or a generated one (title on the story's accent colour) for older stories.
export default function CoverArt({ story, size = 'card' }) {
  if (story.cover) {
    return <img className={`cover cover-${size}`} src={story.cover} alt={`Cover of ${story.title}`} loading="lazy" />;
  }
  return (
    <div className={`cover cover-${size} cover-gen accent-${story.accent || 'sky'}`} role="img" aria-label={`Cover of ${story.title}`}>
      <span>{story.title}</span>
    </div>
  );
}
