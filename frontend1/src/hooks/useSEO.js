import { useEffect } from 'react';

export default function useSEO(titleOrObj, description) {
  const title = titleOrObj && typeof titleOrObj === 'object' ? titleOrObj.title : titleOrObj;
  const desc = titleOrObj && typeof titleOrObj === 'object' ? titleOrObj.description : description;

  useEffect(() => {
    // Set the document title
    document.title = title ? `${title} | Clarior` : 'Clarior - Your Mentorship Journey';

    // Update or create the meta description
    if (desc) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', desc);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = desc;
        document.head.appendChild(metaDescription);
      }
    }
  }, [title, desc]);
}
