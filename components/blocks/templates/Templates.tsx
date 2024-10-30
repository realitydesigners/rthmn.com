import AudioRefBlock from '../nested/AudioRefBlock';
import ImageRefBlock from '../nested/ImageRefBlock';
import InternalLink from '../nested/InternalLink';
import PostsRefBlock from '../nested/PostsRefBlock';
import QuoteRefBlock from '../nested/QuoteRefBlock';
import SplineRefBlock from '../nested/SplineRefBlock';
import VideoRefBlock from '../nested/VideoRefBlock';
import { outfit } from '@/fonts';
import React from 'react';
import { generateHeadingId } from '@/components/learn/TableOfContents';

export type TemplateTheme = 'dark' | 'light' | 'transparent';

const headingStyles: Record<TemplateTheme, string> = {
  dark: `${outfit.className} my-3  w-full  text-white text-3xl font-bold  leading-none tracking-wide md:w-3/4 lg:w-1/2 lg:text-5xl`,
  light: `${outfit.className} my-3 w-11/12 text-black text-4xl font-bold  leading-none tracking-wide md:w-3/4 lg:w-1/2 lg:text-5xl`,
  transparent: `${outfit.className} my-3 w-11/12 text-gray-200 text-4xl font-bold  leading-none tracking-wide md:w-3/4 lg:w-1/2 lg:text-5xl`
};

const listStyles: Record<TemplateTheme, string> = {
  dark: `${outfit.className} w-full text-white  leading-7 md:w-3/4 lg:w-1/2 text-xl list-decimal list-inside outfit-y-6 mb-6`,
  light: `${outfit.className} w-11/12 text-black leading-7 md:w-3/4 text-xl lg:w-1/2  list-decimal list-inside outfit-y-6 mb-6`,
  transparent: `${outfit.className} w-11/12 text-gray-400 leading-7 md:w-3/4 text-xl lg:w-1/2  list-decimal list-inside outfit-y-6 mb-6`
};

const normalTextStyles: Record<TemplateTheme, string> = {
  dark: `${outfit.className} w-full text-white   bg-clip-text leading-[1.4em] tracking-wide text-xl md:w-3/4 lg:w-1/2 lg:text-xl`,
  light: `${outfit.className} text-black leading-[1.5em] tracking-wide text-xl md:w-3/4 lg:w-1/2 lg:text-xl`,
  transparent: `${outfit.className} text-gray-400 leading-[1.5em] tracking-wide text-xl md:w-3/4 lg:w-1/2 lg:text-xl`
};

interface ChildProps {
  props: {
    children: string | string[];
  };
}

const NormalText: React.FC<{
  children: React.ReactNode;
  theme: TemplateTheme;
  value?: any;
}> = React.memo(({ children, theme, value }) => {
  const className = normalTextStyles[theme];

  if (value?.style?.match(/^h[1-6]$/)) {
    const level = parseInt(value.style[1]);
    const textContent = React.Children.toArray(children)
      .map((child) => {
        if (typeof child === 'string') return child;
        if (typeof child === 'object' && 'props' in child) {
          const props = child.props as { children?: string | string[] };
          if (typeof props.children === 'string') return props.children;
          if (Array.isArray(props.children)) return props.children.join('');
        }
        return '';
      })
      .join('')
      .trim();

    const id = generateHeadingId(textContent);
    console.log('Templates - Generated ID:', id, 'for text:', textContent);

    const renderHeading = () => {
      const commonClasses = `${headingStyles[theme]} scroll-mt-24`;

      switch (level) {
        case 1:
          return (
            <h1 id={id} className={commonClasses}>
              {children}
            </h1>
          );
        case 2:
          return (
            <h2 id={id} className={commonClasses}>
              {children}
            </h2>
          );
        case 3:
          return (
            <h3 id={id} className={commonClasses}>
              {children}
            </h3>
          );
        case 4:
          return (
            <h4 id={id} className={commonClasses}>
              {children}
            </h4>
          );
        case 5:
          return (
            <h5 id={id} className={commonClasses}>
              {children}
            </h5>
          );
        case 6:
          return (
            <h6 id={id} className={commonClasses}>
              {children}
            </h6>
          );
        default:
          return <p className={className}>{children}</p>;
      }
    };

    return (
      <div className="flex w-full justify-center p-3">{renderHeading()}</div>
    );
  }

  return (
    <div className="flex w-full justify-center p-3">
      <div className={className}>{children}</div>
    </div>
  );
});

const List: React.FC<{
  type: 'bullet' | 'number';
  children: React.ReactNode;
  theme: TemplateTheme;
}> = React.memo(({ type, children, theme }) => {
  const Tag = type === 'bullet' ? 'ul' : 'ol';
  const className = listStyles[theme];
  return (
    <div className="flex w-full justify-center p-3">
      <Tag className={className}>{children}</Tag>
    </div>
  );
});

interface HeadingComponentProps {
  children: React.ReactNode;
}

const DarkTemplate = {
  block: {
    normal: ({ children, value }: any) => (
      <NormalText theme="dark" value={value}>
        {children}
      </NormalText>
    ),
    h1: ({ children }: HeadingComponentProps) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

      const id = generateHeadingId(text);
      return (
        <div className="flex w-full justify-center p-3">
          <h1
            id={id}
            className={`${headingStyles.dark} scroll-mt-32 text-4xl font-bold`}
          >
            {children}
          </h1>
        </div>
      );
    },
    h2: ({ children }: HeadingComponentProps) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

      const id = generateHeadingId(text);
      return (
        <div className="flex w-full justify-center p-3">
          <h2
            id={id}
            className={`${headingStyles.dark} scroll-mt-32 text-3xl font-bold`}
          >
            {children}
          </h2>
        </div>
      );
    },
    h3: ({ children }: HeadingComponentProps) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

      const id = generateHeadingId(text);
      return (
        <div className="flex w-full justify-center p-3">
          <h3
            id={id}
            className={`${headingStyles.dark} scroll-mt-32 text-2xl font-bold`}
          >
            {children}
          </h3>
        </div>
      );
    },
    h4: ({ children }: HeadingComponentProps) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

      const id = generateHeadingId(text);
      return (
        <div className="flex w-full justify-center p-3">
          <h4
            id={id}
            className={`${headingStyles.dark} scroll-mt-32 text-xl font-bold`}
          >
            {children}
          </h4>
        </div>
      );
    }
  },
  list: {
    bullet: (props) => <List type="bullet" {...props} theme="dark" />,
    number: (props) => <List type="number" {...props} theme="dark" />
  },
  marks: {
    internalLink: ({ value, children }) => {
      const { slug = {}, theme } = value;
      return (
        <InternalLink slug={slug?.current} theme={theme}>
          {children}
        </InternalLink>
      );
    }
  },
  types: {
    postsRef: ({ value }) => {
      const { postsHeading, postsSlug, postsImage } = value.postsRef;

      return (
        <PostsRefBlock
          slug={postsSlug}
          heading={postsHeading}
          image={postsImage}
        />
      );
    },
    videoRef: ({ value }) => {
      const { videoTitle, videoUrl, className } = value.videoRef;
      return (
        <VideoRefBlock
          videoTitle={videoTitle}
          videoUrl={videoUrl}
          className={className}
        />
      );
    },
    spline: ({ value }) => {
      const { url } = value;
      return <SplineRefBlock url={url} />;
    },

    imageRef: ({ value }) => {
      const { image, className } = value;
      return <ImageRefBlock image={image} className={className} />;
    },
    audioRef: ({ value }) => {
      const { audioTitle, audioFileUrl } = value.audioRefData || {};

      return (
        <AudioRefBlock audioFileUrl={audioFileUrl} audioTitle={audioTitle} />
      );
    },
    quoteRef: ({ value }) => {
      const { quoteTitle, quoteImage, className } = value.quoteRef || {};

      return (
        <QuoteRefBlock
          quote={quoteTitle}
          image={quoteImage}
          className={className}
        />
      );
    }
  }
};

const LightTemplate = {
  block: {
    normal: (props) => <NormalText {...props} theme="light" />,
    h1: (props) => <NormalText {...props} theme="light" />,
    h2: (props) => <NormalText {...props} theme="light" />,
    h3: (props) => <NormalText {...props} theme="light" />
  },
  list: {
    bullet: (props) => <List type="bullet" {...props} theme="light" />,
    number: (props) => <List type="number" {...props} theme="light" />
  },
  marks: {
    internalLink: ({ value, children }) => {
      const { slug = {}, theme } = value;
      return (
        <InternalLink slug={slug?.current} theme={theme}>
          {children}
        </InternalLink>
      );
    }
  },
  types: {
    postsRef: ({ value }) => {
      const { postsHeading, postsSlug, postsImage } = value.postsRef;
      return (
        <PostsRefBlock
          slug={postsSlug}
          heading={postsHeading}
          image={postsImage}
        />
      );
    },
    videoRef: ({ value }) => {
      const { videoTitle, videoUrl, className } = value.videoRef;

      return (
        <VideoRefBlock
          videoTitle={videoTitle}
          videoUrl={videoUrl}
          className={className}
        />
      );
    },
    spline: ({ value }) => {
      const { url } = value;
      return <SplineRefBlock url={url} />;
    },
    imageRef: ({ value }) => {
      const { image, className } = value;
      return <ImageRefBlock image={image} className={className} />;
    },
    audioRef: ({ value }) => {
      return <AudioRefBlock {...(value.audioRefData || {})} />;
    },
    quoteRef: ({ value }) => {
      const { quoteTitle, quoteImage, className } = value.quoteRef || {};

      return (
        <QuoteRefBlock
          quote={quoteTitle}
          image={quoteImage}
          className={className}
        />
      );
    }
  }
};
const TransparentTemplate = {
  block: {
    normal: (props) => <NormalText {...props} theme="transparent" />,
    h1: (props) => <NormalText {...props} theme="transparent" />,
    h2: (props) => <NormalText {...props} theme="transparent" />,
    h3: (props) => <NormalText {...props} theme="transparent" />
  },
  list: {
    bullet: (props) => <List type="bullet" {...props} theme="transparent" />,
    number: (props) => <List type="number" {...props} theme="transparent" />
  },
  marks: {
    internalLink: ({ value, children }) => {
      const { slug = {}, theme } = value;
      return (
        <InternalLink slug={slug?.current} theme={theme}>
          {children}
        </InternalLink>
      );
    }
  },
  types: {
    postsRef: ({ value }) => {
      const { postsHeading, postsSlug, postsImage } = value.postsRef;
      return (
        <PostsRefBlock
          slug={postsSlug}
          heading={postsHeading}
          image={postsImage}
        />
      );
    },
    videoRef: ({ value }) => {
      const { videoTitle, videoUrl, className } = value.videoRef;

      return (
        <VideoRefBlock
          videoTitle={videoTitle}
          videoUrl={videoUrl}
          className={className}
        />
      );
    },
    spline: ({ value }) => {
      const { url } = value;
      return <SplineRefBlock url={url} />;
    },
    imageRef: ({ value }) => {
      const { image, className } = value;

      return <ImageRefBlock image={image} className={className} />;
    },
    audioRef: ({ value }) => {
      return <AudioRefBlock {...(value.audioRefData || {})} />;
    },
    quoteRef: ({ value }) => {
      const { quoteTitle, quoteImage, className } = value.quoteRef || {};

      return (
        <QuoteRefBlock
          quote={quoteTitle}
          image={quoteImage}
          className={className}
        />
      );
    }
  }
};

const VideoTemplate = {
  block: {
    normal: (props) => <NormalText {...props} theme="light" />,
    h1: (props) => <NormalText {...props} theme="light" />,
    h2: (props) => <NormalText {...props} theme="light" />,
    h3: (props) => <NormalText {...props} theme="light" />
  },
  list: {
    bullet: (props) => <List type="bullet" {...props} theme="light" />,
    number: (props) => <List type="number" {...props} theme="light" />
  }
};

const TeamTemplate = {
  block: {
    normal: (props) => <NormalText {...props} theme="dark" />,
    h1: (props) => <NormalText {...props} theme="dark" />,
    h2: (props) => <NormalText {...props} theme="dark" />,
    h3: (props) => <NormalText {...props} theme="dark" />
  },
  list: {
    bullet: (props) => <List type="bullet" {...props} theme="dark" />,
    number: (props) => <List type="number" {...props} theme="dark" />
  }
};

export {
  DarkTemplate,
  LightTemplate,
  TransparentTemplate,
  TeamTemplate,
  VideoTemplate
};
