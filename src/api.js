const moreLikeCache = {};

async function cacheFetch(url) {
  if ( moreLikeCache[url]) {
    return Promise.resolve( moreLikeCache[url] );
  } else {
    const response = await fetch(url);
    const data = await response.json();
    moreLikeCache[url] = data;
    return data;
  }
}

async function getLinks(pageTitle) {
  // Encode the page title and build the API URL
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
    pageTitle
  )}&prop=text&format=json&origin=*`;

  try {
    // Fetch the parsed HTML content of the page
    const data = await cacheFetch(apiUrl);
    if ( data.error ) {
      return null;
    }

    // Parse the returned HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.parse.text["*"], "text/html");

    // Select all anchor (<a>) elements on the page
    const links = doc.querySelectorAll("a:not(.hatnote a):not(.ambox a):not(.mw-disambig):not(.external):not(.external ~ a):not(.mw-redirect):not(.infobox a):not(cite a):not(.refbegin):not(.references a):not(.navbox a)");

    return Array.from(links).map((link) => link.title).filter((t) => t &&
      t !== pageTitle &&
      !t.includes(':') && ![
        'Edit this at Wikidata',
        'Play audio',
        'Wayback Machine'
      ].includes(t));
  } catch (error) {
    console.error("Error fetching or parsing page:", error);
  }
}

function intersection(arr1, arr2) {
  // Convert one array to a Set for efficient lookup
  const set2 = new Set(arr2);
  
  // Filter the first array to keep only elements present in the set
  return Array.from( new Set( arr1 ) ).filter(item => set2.has(item));
}

function countLinkOccurances(links) {
  const countLinks = {};
  links.forEach((l) => {
    countLinks[l] = countLinks[l] || 0;
    countLinks[l]++;
  });
  return countLinks;
}

function mostLinks(titles) {
  return Promise.all(
    titles.map((t) => getLinks(t)).slice(0,3)
  ).then((links) => {
    if ( !links[0] || !links[1] ) {
      // invalid titles.
      return [];
    }
    // find the most common occurances.
    
    const commonLinks = intersection( links[0], links.slice(1).flat() );
    const countLinksA = countLinkOccurances(links[0]);
    const countLinksB = countLinkOccurances(links[1]);
    const frequentLinks = commonLinks.filter((t)=> !titles.includes(t)).sort((a,b) => {
      return (
        countLinksA[a] + countLinksB[b]
      ) / 2 > (
        countLinksB[a] + countLinksB[b]
      ) ? -1 : 1;
    }).filter((a) => countLinksA[a] > 1 || countLinksB[a] > 1 )
    return frequentLinks.map((title) => ( { title } ) );
  })
}

export default { mostLinks };
