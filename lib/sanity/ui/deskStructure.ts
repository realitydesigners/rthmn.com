import { DocumentIcon, ImageIcon, TagIcon } from '@sanity/icons';
import type { StructureBuilder } from 'sanity/structure';

export const StudioStructure = (S: StructureBuilder) =>
    S.list()
        .title('Content')
        .items([
            // Pages
            S.listItem()
                .title('Pages')
                .icon(DocumentIcon)
                .child(S.documentTypeList('page')),

            // Content
            S.listItem()
                .title('Content')
                .icon(DocumentIcon)
                .child(
                    S.list()
                        .title('Content')
                        .items([
                            S.listItem().title('Posts').icon(DocumentIcon).child(S.documentTypeList('posts')),
                            S.listItem().title('FAQ').icon(DocumentIcon).child(S.documentTypeList('faq')),
                            S.listItem().title('Team').icon(TagIcon).child(S.documentTypeList('team')),
                            S.listItem().title('Categories').icon(TagIcon).child(S.documentTypeList('category')),
                            S.listItem().title('Market Data').icon(TagIcon).child(S.documentTypeList('marketData')),
                            S.listItem().title('Changelog').icon(TagIcon).child(S.documentTypeList('changelog')),
                            S.listItem()
                                .title('Pair Snapshots')
                                .icon(TagIcon)
                                .child(S.documentTypeList('pairSnapshot')),
                        ])
                ),
            S.listItem()
                .title('Courses')
                .icon(DocumentIcon)
                .child(
                    S.list()
                        .title('Courses')
                        .items([
                            S.listItem().title('Courses').icon(DocumentIcon).child(S.documentTypeList('course')),
                            S.listItem().title('Chapters').icon(DocumentIcon).child(S.documentTypeList('chapter')),
                            S.listItem().title('Lessons').icon(DocumentIcon).child(S.documentTypeList('lesson')),
                            S.listItem().title('Glossary').icon(DocumentIcon).child(S.documentTypeList('glossary')),
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
                            S.listItem().title('Images').icon(ImageIcon).child(S.documentTypeList('img')),
                            S.listItem().title('Videos').icon(ImageIcon).child(S.documentTypeList('video')),
                            S.listItem().title('Audio').icon(ImageIcon).child(S.documentTypeList('audio')),
                        ])
                ),
        ]);
