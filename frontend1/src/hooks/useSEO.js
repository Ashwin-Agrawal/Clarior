import { useEffect } from 'react';

export default function useSEO(title, description) {
  useEffect(() => {
    // Set the document title
    document.title = title ? `${title} | Clarior` : 'Clarior - Your Mentorship Journey';

    // Update or create the meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = description;
        document.head.appendChild(metaDescription);
      }
    }
  }, [title, description]);
}
