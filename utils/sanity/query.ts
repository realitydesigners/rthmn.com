import { defineQuery } from 'next-sanity';

// Base fragments for reusable query parts
const imageFragment = /* groq */ `
  image{
    ...,
    "alt": coalesce(asset->altText, asset->originalFilename, "Image-Broken"),
    "blurData": asset->metadata.lqip,
    "dominantColor": asset->metadata.palette.dominant.background,
  }
`;

const customLinkFragment = /* groq */ `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
  }
`;

const markDefsFragment = /* groq */ `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

const richTextFragment = /* groq */ `
  richText[]{
    ...,
    ${markDefsFragment}
  }
`;

const heroBlock = /* groq */ `
  _type == "hero" => {
    ...,
    ${imageFragment},
    ${richTextFragment},
    title,
    subtitle,
    ctaButton,
    "featuredPartners": *[_type == "project" && defined(logo)] {
      name,
      "logo": logo.asset->url,
      "slug": slug.current
    }
  }
`;

const foundingPartnersBlock = /* groq */ `
  _type == "foundingPartners" => {
    ...,
    title,
    "partners": partners[]-> {
      name,
      roles,
      "image": degenImage.asset->url,
      bulletPoints[] {
        "icon": icon.asset->url,
        text
      },
      socials
    }
  }
`;

const partnerCtaBlock = /* groq */ `
  _type == "partnerCta" => {
    ...,
    title,
    description,
    buttonText,
    buttonLink,
    "image": image.asset->url
  }
`;

const portfolioGridBlock = /* groq */ `
  _type == "portfolioGrid" => {
    ...,
    title,
    description,
    showMap,
    showStats,
    featuredOnly
  }
`;

const portfolioBlock = /* groq */ `
  _type == "portfolio" => {
    ...,
    title,
    description,
    showFilters,
    "projects": *[_type == "project"] {
      name,
      description,
      category,
      location,
      series,
      founded,
      "slug": slug.current,
      tags[] {
        name,
        "icon": icon.asset->url
      },
      "logo": logo.asset->url
    }
  }
`;

const teamBlock = /* groq */ `
  _type == "team" => {
    ...,
    title,
    subtitle,
    description,
    "teamMembers": *[_type == "teamMember"] | order(order asc) {
      _id,
      name,
      role,
      bio,
      "image": image.asset->url,
      socials,
      bulletPoints[] {
        "icon": icon.asset->url,
        text
      }
    }
  }
`;

const aboutHeroBlock = /* groq */ `
  _type == "aboutHero" => {
    ...,
    title,
    description
  }
`;

const firstChecksBlock = /* groq */ `
  _type == "firstChecks" => {
    ...,
    title,
    description
  }
`;

const investmentPrinciplesBlock = /* groq */ `
  _type == "investmentPrinciples" => {
    ...,
    title,
    principles[] {
      title,
      description,
      "icon": icon.asset->url
    }
  }
`;

const investmentPrinciplesGridBlock = /* groq */ `
  _type == "investmentPrinciplesGrid" => {
    ...,
    title,
    principles[] {
      title,
      description,
      "icon": icon.asset->url
    }
  }
`;

const newsGridBlock = /* groq */ `
  _type == "newsGrid" => {
    ...,
    "articles": *[_type == "news"] | order(publishDate desc) {
      _id,
      title,
      "slug": slug.current,
      image,
      category,
      publishDate,
      description
    }
  }
`;

const pageBuilderFragment = /* groq */ `
  pageBuilder[]{
    ...,
    _type,
    _type == "hero" => {
      ...,
      _key,
      title,
      content,
      showFAQ
    },
    _type == "teamGrid" => {
      ...,
      _key,
      layout
    },
    _type == "contentBlock" => {
      ...,
      _key,
      title,
      content,
      layout
    },
    _type == "legalContentBlock" => {
      ...,
      _key,
      title,
      content,
      layout
    },
     _type == "changelogBlock" => {
      ...,
      _key,
      title,
      subtitle,
    },
    ${heroBlock},
    ${foundingPartnersBlock},
    ${partnerCtaBlock},
    ${portfolioGridBlock},
    ${portfolioBlock},
    ${teamBlock},
    ${aboutHeroBlock},
    ${firstChecksBlock},
    ${investmentPrinciplesBlock},
    ${investmentPrinciplesGridBlock},
    ${newsGridBlock}
  }
`;

export const queryHomePageData = defineQuery(/* groq */ `*[_type == "page" && slug.current == "/"][0]{
    ...,
    _id,
    _type,
    "slug": slug.current,
    title,
    description,
    ${pageBuilderFragment}
}`);

export const querySlugPageData = defineQuery(/* groq */ `
  {
   
    "data": *[_type == "page" && slug.current == $slug][0]{
      ...,
      "slug": slug.current,
      ${pageBuilderFragment}
    }
  }
  `);

export const querySlugPagePaths = `
  *[_type == "page" && defined(slug.current) && slug.current != "/"][].slug.current
`;

const ogFieldsFragment = /* groq */ `
  _id,
  _type,
  "title": select(
    defined(ogTitle) => ogTitle,
    defined(seoTitle) => seoTitle,
    title
  ),
  "description": select(
    defined(ogDescription) => ogDescription,
    defined(seoDescription) => seoDescription,
    description
  ),
  "image": image.asset->url + "?w=566&h=566&dpr=2&fit=max",
  "dominantColor": image.asset->metadata.palette.dominant.background,
  "seoImage": seoImage.asset->url + "?w=1200&h=630&dpr=2&fit=max", 
  "logo": *[_type == "settings"][0].logo.asset->url + "?w=80&h=40&dpr=3&fit=max&q=100",
  "date": coalesce(date, _createdAt)
`;

export const queryHomePageOGData = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == "/"][0]{
    ${ogFieldsFragment}
  }
  `);

export const querySlugPageOGData = defineQuery(/* groq */ `
  *[_type == "page" && slug.current == $slug][0]{
    ${ogFieldsFragment}
  }
`);

export const queryBlogPageOGData = defineQuery(/* groq */ `
  *[_type == "blog" && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const queryGenericPageOGData = defineQuery(/* groq */ `
  *[ defined(slug.current) && _id == $id][0]{
    ${ogFieldsFragment}
  }
`);

export const querySitemapData = defineQuery(/* groq */ `{
  "slugPages": *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  },
  "blogPages": *[_type == "blog" && defined(slug.current)]{
    "slug": slug.current,
    "lastModified": _updatedAt
  }
}`);

export const queryPortfolioData = defineQuery(/* groq */ `
  *[_type == "project"] | order(name asc) {
    _id,
    name,
    description,
    category,
    "logo": logo.asset->url,
    "slug": slug.current,
    websiteUrl,
    series,
    founded,
    location,
    coordinates,
    companyOverview,
    tags[] {
      name,
      "icon": icon.asset->url
    }
  }
`);

// Update the portfolio item query to match your original working query
export const queryPortfolioItem = defineQuery(/* groq */ `
  *[_type == "project" && slug.current == $slug][0] {
    name,
    description,
    category,
    location,
    coordinates,
    series,
    founded,
    "slug": slug.current,
    tags[] {
        name,
        "icon": icon.asset->url
    },
    "logo": logo.asset->url,
    companyOverview,
    content,
    websiteUrl,
    socialLinks
  }
`);

export const queryNewsArticle = defineQuery(/* groq */ `
  *[_type == "news" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    image,
    category,
    publishDate,
    description,
    sections[] {
      title,
      content,
      mediaGallery[] {
        asset->{ url },
        alt,
        caption
      },
      callToAction
    }
  }
`);
