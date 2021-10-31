import { IconLinkExternal, IconPlay } from '@/components/ui/icons/Icons'
import CustomEmbed, { canEmbed } from '@/components/ui/CustomEmbed'
import { useState } from 'react'
import MessageImageDialog from '@/components/message/MessageImageDialog'

export default function PostEmbed({ metadata, dark = false }) {
  const [playing, setPlaying] = useState(false)
  const embeddable = canEmbed(metadata.url)
  const themeColor = metadata.themeColor
    ?.replaceAll(' ', '')
    .trim()
    .toLowerCase()
  const isWhite =
    !themeColor ||
    themeColor.startsWith('rgb(255,255,255') ||
    themeColor.startsWith('rgba(255,255,255') ||
    (themeColor.startsWith('#') &&
      ![...themeColor.substring(1)].find(c => c !== 'f'))
  return (
    <div>
      <div
        className={`rounded inline-flex transition ${
          dark
            ? `dark:bg-gray-850 ${isWhite ? 'dark:border-gray-950' : ''}`
            : `dark:bg-gray-800 ${isWhite ? 'dark:border-gray-900' : ''}`
        } pt-4 border-l-4`}
        style={isWhite ? {} : { borderColor: metadata.themeColor }}
      >
        <div className="flex flex-col flex-grow pb-4 pl-4 pr-4 rounded-r-md">
          <div className="max-w-[400px] space-y-3">
            {metadata.publisher && (
              <div className="text-xs text-secondary">{metadata.publisher}</div>
            )}
            <div className="leading-none">
              <a
                href={metadata.url}
                rel="noopener nofollow noreferrer"
                target="_blank"
                className="text-sm font-semibold text-blue-400 hover:underline"
              >
                {metadata.title ?? 'No title'}
              </a>
            </div>

            {metadata.description && !embeddable && (
              <div
                className="text-13 text-secondary line-clamp-9"
                dangerouslySetInnerHTML={{
                  __html: metadata.description ?? 'No description'
                }}
              />
            )}

            {(embeddable ||
              (metadata.image &&
                metadata.twitterCard === 'summary_large_image')) && (
              <div className={`pt-1 ${playing ? 'min-w-[400px]' : ''}`}>
                {playing ? (
                  <CustomEmbed url={metadata.url} />
                ) : (
                  <div
                    className="max-w-[400px] w-full relative rounded cursor-pointer"
                    onClick={() => {
                      if (embeddable) {
                        setPlaying(true)
                      }
                    }}
                  >
                    {embeddable ? (
                      <>
                        <img
                          alt="Thumbnail"
                          src={metadata.image?.smallUrl}
                          className="rounded select-none"
                          height={metadata.image?.smallHeight}
                          width={metadata.image?.smallWidth}
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex p-3 space-x-3 bg-black bg-opacity-75 rounded-full text-tertiary">
                            <IconPlay className="w-6 h-6 text-gray-600 transition cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
                            <IconLinkExternal
                              onClick={e => {
                                e.stopPropagation()
                                e.preventDefault()
                                window.open(metadata.url, '_blank')
                              }}
                              className="w-6 h-6 text-gray-600 transition cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <MessageImageDialog image={metadata.image} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!!metadata.image &&
          metadata.twitterCard !== 'summary_large_image' &&
          !embeddable && (
            <div className="pr-4">
              <MessageImageDialog
                width={80}
                height={80}
                image={metadata.image}
              />
              {/*<img
                alt="Thumbnail"
                src={metadata.image}
                className="object-cover w-20 min-w-[5rem] rounded max-h-[5rem] cursor-pointer h-auto cursor-pointer"
              />*/}
            </div>
          )}
      </div>
    </div>
  )
}
