import { StructureBuilder } from 'sanity/structure';
import { ImageIcon, DocumentIcon, TagIcon, HomeIcon } from '@sanity/icons';

export const StudioStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Pages
      S.listItem()
        .title('Pages')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('About Page')
                .icon(DocumentIcon)
                .child(
                  S.editor()
                    .id('aboutPage')
                    .schemaType('page')
                    .documentId('about')
                ),
              S.listItem()
                .title('Section Page')
                .icon(DocumentIcon)
                .child(
                  S.editor()
                    .id('sectionPage')
                    .schemaType('page')
                    .documentId('section')
                )
            ])
        ),

      // Content
      S.listItem()
        .title('Content')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Content')
            .items([
              S.listItem()
                .title('Posts')
                .icon(DocumentIcon)
                .child(S.documentTypeList('posts')),
              S.listItem()
                .title('Modules')
                .icon(DocumentIcon)
                .child(S.documentTypeList('module')),
              S.listItem()
                .title('Lessons')
                .icon(DocumentIcon)
                .child(S.documentTypeList('lesson')),
              S.listItem()
                .title('Glossary')
                .icon(DocumentIcon)
                .child(S.documentTypeList('glossary')),
              S.listItem()
                .title('FAQ')
                .icon(DocumentIcon)
                .child(S.documentTypeList('faq'))
            ])
        ),

      // Media
      S.listItem()
        .title('Media')
        .icon(ImageIcon)
        .child(
          S.list()
            .title('Media')
            .items([
              S.listItem()
                .title('Images')
                .icon(ImageIcon)
                .child(S.documentTypeList('img')),
              S.listItem()
                .title('Videos')
                .icon(ImageIcon)
                .child(S.documentTypeList('video')),
              S.listItem()
                .title('Audio')
                .icon(ImageIcon)
                .child(S.documentTypeList('audio'))
            ])
        ),

      // Settings
      S.listItem()
        .title('Settings')
        .icon(TagIcon)
        .child(
          S.list()
            .title('Settings')
            .items([
              S.listItem()
                .title('Team')
                .icon(TagIcon)
                .child(S.documentTypeList('team')),
              S.listItem()
                .title('Categories')
                .icon(TagIcon)
                .child(S.documentTypeList('category')),
              S.listItem()
                .title('Market Data')
                .icon(TagIcon)
                .child(S.documentTypeList('marketData')),
              S.listItem()
                .title('Changelog')
                .icon(TagIcon)
                .child(S.documentTypeList('changelog'))
            ])
        )
    ]);
