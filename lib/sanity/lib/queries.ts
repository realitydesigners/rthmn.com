import { groq } from 'next-sanity';
import { client } from './client';

export const settingsQuery = groq`
  *[_type == "settings"][0] {
    footer,
    menuItems[]-> {
      _type,
      "slug": slug.current,
      title
    },
    ogImage,
  }
`;

export const postsQuery = groq`
  *[_type == "posts"] | order(_createdAt desc)[0...40] {
    slug,
    block[] {
      ...,
      heading,
      subheading,
      layout,
      title,
      publicationDate,
      "imageRef": {
        ...,
        "imageUrl": imageRef->image.asset->url,
        "imageAlt": imageRef->alt,
      },
      team-> {
        ...,
        name,
        role,
        image,
        shortBio,
      },
    },
  }
`;

export const postsBySlugQuery = groq`
  *[_type == "posts" && slug.current == $slug][0] {
    slug,
    block[] {
      ...,
      heading,
      subheading,
      tags,
      category->,
      layout,
      publicationDate,
      team->,
      _type == "imageCanvasBlock" => {
        layout,
        image->,
        team->, 
        alt,
      },
      "imageRef": {
        ...,
        "imageUrl": imageRef->image.asset->url,
        "imageAlt": imageRef->alt,
      },
      content[] {
        ...,
        image-> {
          ...,
          className->{name},
          team->,
        },
        markDefs[] {
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug
          }
        },
        "videoRef": {
          ...,
          "videoTitle": video->title,
          "videoFileUrl": video->video.asset->url,
          "videoImage": video->image.asset->url,
          "videoUrl": video->url,
          "videoTeam": video->team,
        },
        "audioRefData": {
          "audioTitle": audio->title,
          "audioFileUrl": audio->audioFile.asset->url
        },
        "postsRef": {
          "postsHeading": posts->block[0].heading,
          "postsSlug": posts->slug.current,
          "postsImage": posts->block[0].imageRef->image.asset->url,
        },
      },
    },
  }
`;

export const categoryQuery = groq`
  *[_type == "category"] {
    _id,
    _type,
    title,
    isMain,
    slug,
    model-> {
      ...,
      file,
    },
    sceneIdentifier,
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    isMain,
    slug,
    model-> {
      ...,
      file,
    },
    sceneIdentifier,
    "subCategories": *[_type == "category" && references(^._id)] {
      _id,
      _type,
      title,
      slug,
      isMain,
      model-> {
        ...,
        file,
      },
      "refPosts": *[_type == "posts" && references(^._id)] {
        _id,
        title,
        slug,
        block[] {
          ...,
          heading,
          subheading,
          image,
          tags,
          layout,
          title,
          publicationDate,
          team-> {
            ...,
            name,
            role,
            image,
            shortBio,
          },
        },
      }
    },
  }
`;

export const getVideosQuery = groq`
  *[_type == "video"][0..30] | order(_createdAt desc) {
    title,
    slug,
    url,
    image,
    video,
    subcategories[]-> {
      ...,
      name,
      title,
    },
  }
`;

export const getVideoBySlugQuery = groq`
  *[_type == "video" && slug.current == $slug][0] {
    title,
    slug,
    url,
    image,
    video,
    subcategories[]-> {
      ...,
      name,
      title,
    },
    block[] {
      ...,
      heading,
      subHeading,
      url,
      image,
      tags,
      layout,
      title,
      publicationDate,
      team-> {
        ...,
        name,
        role,
        image,
        shortBio,
      },
      content[] {
        ...,
      },
    },
  }
`;

export const teamQuery = groq`
  *[_type == "team"] | order(_createdAt asc) {
    name,
    role,
    image,
    scene,
    shortBio,
    bio[] {
      ...,
    },
    content[] {
      ...,
    },
    slug,
    title,    
  }
`;

export const teamBySlugQuery = groq`
  *[_type == "team" && slug.current == $slug][0] {
    name,
    role,
    image,
    scene,
    shortBio,
    block[] {
      ...,
      heading,
      subHeading,
      image,
      tags,
      layout,
      title,
      publicationDate,
      team-> {
        ...,
        name,
        role,
        image,
        shortBio,
      },
      content[] {
        ...,
      },
    },
    slug,
    title,    
    instagram,
    twitter,
    website,
    tiktok,
  }
`;

export const glossaryQuery = groq`
  *[_type == "glossary"] | order(_createdAt asc) {
    name,
    role,
    title,
    image,
    scene,
    shortBio,
    bio[] {
      ...,
    },
    content[] {
      ...,
    },
    slug,
    title,    
  }
`;

export const glossaryBySlugQuery = groq`
  *[_type == "glossary" && slug.current == $slug][0] {
    name,
    image,
    scene,
    block[] {
      ...,
      heading,
      subHeading,
      image,
      tags,
      layout,
      title,
      content[] {
        ...,
      },
    },
    slug,
    title,    
    instagram,
    twitter,
    website,
    tiktok,
  }
`;

export const pageQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    content
  }
`;

export const pairSnapshotQuery = groq`
  *[_type == "pairSnapshot" && pair == $pair][0] {
    _type,
    pair,
    candleData,
    lastUpdated
  }
`;

export async function getModules() {
    return client.fetch(
        groq`*[_type == "module"] | order(order asc) {
      _id,
      title,
      description,
      slug,
      "lessons": lessons[]-> {
        _id,
        title,
        description,
        slug,
        order
      } | order(order asc)
    }`
    );
}

export async function getModule(moduleSlug: string) {
    return client.fetch(
        groq`*[_type == "module" && slug.current == $moduleSlug][0] {
      _id,
      title,
      description,
      slug,
      "lessons": lessons[]-> {
        _id,
        title,
        description,
        slug,
        content,
        order
      } | order(order asc)
    }`,
        { moduleSlug }
    );
}

export async function getChangeLog() {
    return client.fetch(
        groq`*[_type == "changelog"] | order(releaseDate desc) {
      _id,
      title,
      description,
      version,
      releaseDate,
      type,
      content[] {
        ...,
        _type,
        style,
        children,
        markDefs[] {
          ...,
        }
      },
      status,
      contributors[]->{
        _id,
        name,
        "image": {
          "asset": {
            "url": image.asset->url
          }
        }
      }
    }`
    );
}

export const marketDataQuery = groq`
  *[_type == "marketData" && pair == $pair][0] {
    pair,
    lastUpdated,
    candles[] {
      timestamp,
      open,
      high,
      low,
      close
    }
  }
`;

export const allMarketDataQuery = groq`
  *[_type == "marketData"] {
    pair,
    lastUpdated,
    candleData
  }
`;

export async function getCourses() {
    return client.fetch(
        groq`*[_type == "course"] | order(order asc) {
            _id,
            title,
            description,
            slug,
            icon,
            difficulty,
            estimatedTime,
            "modules": *[_type == "module" && references(^._id)] | order(order asc) {
                _id,
                title,
                description,
                slug,
                "lessons": *[_type == "lesson" && references(^._id)] | order(order asc) {
                    _id,
                    title,
                    description,
                    slug
                }
            }
        }`
    );
}

export async function getCourse(slug: string) {
    const course = await client.fetch(
        `*[_type == "course" && slug.current == $slug][0]{
            _id,
            title,
            description,
            "slug": slug.current,
            icon,
            difficulty,
            "chapters": chapters[]-> {
                _id,
                title,
                description,
                "slug": slug.current,
                order,
                "lessons": lessons[]-> {
                    _id,
                    title,
                    description,
                    "slug": slug.current,
                    order,
                    courseContent[] {
                        ...,
                        content[] {
                            ...,
                            _type == 'boxVisualizer' => {
                                _type,
                                title,
                                description,
                                mode,
                                showLabels,
                                sequencesData,
                                baseValuesData,
                                colorScheme,
                                animationSpeed,
                                pauseDuration
                            }
                        }
                    }
                } | order(order asc)
            } | order(order asc)
        }`,
        { slug }
    );

    console.log('Fetched course data:', JSON.stringify(course, null, 2));
    return course;
}

export async function getLesson(slug: string) {
    return client.fetch(`*[_type == "lesson" && slug.current == $slug][0]`, {
        slug,
    });
}
