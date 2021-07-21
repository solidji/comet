import { Link } from 'react-router-dom'

import { IconDownload } from '@/components/ui/icons/Icons'
import { Meteors } from '@/components/ui/meteors'
import Page from '@/components/ui/page/Page'
import {
  VectorGrass,
  VectorLogo,
  VectorTelescopeMan
} from '@/components/ui/vectors'
import { getDownloadLink } from '@/hooks/getDownloadLink'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import { getOS } from '@/utils/getOS'

const container = 'relative z-10 max-w-screen-lg xl:max-w-screen-xl mx-auto'
const iconButton =
  'p-3 hover:bg-gray-700 transition rounded-full cursor-pointer'

export default function LandingPage() {
  const [currentUser] = useCurrentUser()

  const os = getOS()
  const downloadLink = getDownloadLink()

  return (
    <Page>
      <div className="relative flex flex-col items-center flex-grow">
        <div className={`fixed top-0 left-0 right-0 z-50 transition`}>
          <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-red-500" />

          <div className="flex items-center h-16 px-24">
            <VectorLogo className="h-6 text-secondary" />

            {/* <div className="inline-flex items-center ml-auto space-x-3">
              <Tippy content="Comet Discord Server">
                <a
                  href="https://discord.gg/NPCMGSm"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${iconButton}`}
                >
                  <IconDiscord size={20} className="text-gray-200" />
                </a>
              </Tippy>

              <Tippy content="@joincometapp on Twitter">
                <a
                  href="https://twitter.com/joincometapp"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={iconButton}
                >
                  <IconTwitter size={20} className="text-gray-200" />
                </a>
              </Tippy>

              <Tippy content="Comet on GitHub">
                <a
                  href="https://github.com/joincomet/comet"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={iconButton}
                >
                  <IconGithub size={20} className="text-gray-200" />
                </a>
              </Tippy>
            </div> */}
          </div>
        </div>

        <div
          style={{
            backgroundImage:
              'radial-gradient(ellipse at top , #17181E 0%,  #25282E 95%)'
          }}
          className="relative w-full py-64 overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 right-0 z-10 flex text-gray-900">
            <VectorGrass className="w-1/2" />
            <VectorGrass className="w-1/2" />
          </div>
          <VectorTelescopeMan className="absolute bottom-0 z-10 text-gray-900 right-32 h-96" />
          <Meteors />

          <div className={container}>
            <div className="flex flex-col items-center space-y-12 text-center">
              <h1 className="inline-flex items-center">
                <div className="text-5xl font-semibold tracking-tight text-white">
                  All-in-one chat and forums for communities.
                </div>
              </h1>
              <p className="max-w-screen-md text-xl text-white">
                The age of fragmented communities is over. Say goodbye to Reddit
                and Discord, and run your entire community on Comet.
              </p>
              <div className="inline-flex items-center space-x-6">
                <a
                  href={downloadLink}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="bg-blue-500 select-none h-12 px-6 rounded-full inline-flex items-center text-lg text-white transition transform shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  Download for {os}
                  <IconDownload className="w-6 h-6 ml-3" />
                </a>

                <Link
                  to="/"
                  className="border border-gray-700 select-none h-12 px-6 rounded-full inline-flex items-center text-lg text-white transition transform shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  Open in Browser
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
