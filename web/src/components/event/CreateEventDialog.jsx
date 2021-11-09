import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import StyledDialog from '@/components/ui/dialog/StyledDialog'
import ServerSelect from '@/components/post/create/ServerSelect'
import {
  IconCheck,
  IconEdit,
  IconSpinner,
  IconUserToServerArrow
} from '@/components/ui/icons/Icons'
import Switch from '@/components/ui/Switch'
import {
  CurrentUserDocument,
  useCreateEventMutation,
  useUpdateEventMutation
} from '@/graphql/hooks'
import { readURL } from '@/utils/readURL'
import Tippy from '@tippyjs/react'

// const titleRegex = /^[A-Za-z0-9_]+$/i
const titleRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/i

export default function CreateEventDialog({ open, setOpen, event, serverId }) {
  const { push } = useHistory()
  const [currentUser] = useCurrentUser()
  const servers = currentUser?.servers ?? []
  const [server, setServer] = useState(
    serverId ? servers?.find(s => s.id === serverId) : null
  )

  const [createEvent, { loading: createLoading }] = useCreateEventMutation()
  const [updateEvent, { loading: updateLoading }] = useUpdateEventMutation()
  const {
    handleSubmit,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange'
  })
  watch((values, { type, value, name }) => {
    if (name === 'bannerFile') {
      const { bannerFile } = values
      if (!bannerFile || !bannerFile[0]) return
      readURL(bannerFile[0]).then(url => setBannerSrc(url))
    }
  })
  const title = watch('title')
  const [bannerSrc, setBannerSrc] = useState(event?.bannerUrl)

  useEffect(() => {
    if (!event) {
      reset()
      setBannerSrc(null)
    } else {
      //reset()
      setBannerSrc(event.bannerUrl)
      setValue('title', event.title || '')
      setValue('description', event.description || '')
    }
  }, [event])

  const onSubmit = ({ title, description, bannerFile }) => {
    if (!event) {
      createEvent({
        variables: {
          input: {
            serverId: server.id,
            title,
            description,
            bannerFile: bannerFile ? bannerFile[0] : null
          }
        }
      }).then(({ data: { createEvent } }) => {
        setOpen(false)
        reset()
        push(`${createEvent?.relativeUrl}`)
      })
    } else {
      updateEvent({
        variables: {
          input: {
            eventId: event.id,
            title,
            description,
            bannerFile: bannerFile ? bannerFile[0] : null
          }
        }
      }).then(() => {
        setOpen(false)
      })
    }
  }

  const close = () => {
    setOpen(false)
  }

  return (
    <StyledDialog
      open={open}
      close={close}
      closeOnOverlayClick
      onSubmit={handleSubmit(onSubmit)}
      buttons={
        !event ? (
          <button
            type="submit"
            className={`form-button-submit`}
            disabled={
              !title || title?.length < 3 || createLoading
              //  || !titleRegex.test(title)
            }
          >
            {createLoading ? (
              <IconSpinner className="w-5 h-5 text-primary" />
            ) : (
              <IconUserToServerArrow className="w-5 h-5 text-primary" />
            )}
          </button>
        ) : (
          <Tippy content="Save Changes">
            <button
              type="submit"
              className={`form-button-submit`}
              disabled={updateLoading || title?.length < 3}
            >
              {updateLoading ? (
                <IconSpinner className="w-5 h-5 text-primary" />
              ) : (
                <IconCheck className="w-5 h-5 text-primary" />
              )}
            </button>
          </Tippy>
        )
      }
    >
      <input
        type="file"
        {...register('bannerFile')}
        className="hidden"
        id="bannerFile"
        accept="image/png,image/jpeg,image/webp,image/gif"
      />

      <label
        htmlFor="bannerFile"
        className={`h-24 block relative rounded-t-lg group cursor-pointer bg-center bg-cover ${
          bannerSrc ? '' : 'bg-gradient-to-br from-red-400 to-indigo-600'
        }`}
        style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : {}}
      >
        <div className="absolute inset-0 flex items-center justify-center transition bg-black rounded-t-lg opacity-0 group-hover:opacity-50">
          <IconEdit className="w-10 h-10" />
        </div>
      </label>

      <div className="px-5 py-5 space-y-3 text-left">
        <div>
          <input
            {...register('title', {
              // pattern: titleRegex,
              minLength: 3,
              maxLength: 100,
              required: true
            })}
            placeholder="Title"
            className="form-input-lg"
            minLength={3}
            maxLength={100}
          />
          {errors.title?.type === 'pattern' && (
            <div className="form-error">
              Letters, numbers and underscores only
            </div>
          )}
        </div>
        <textarea
          {...register('description', { maxLength: 500 })}
          placeholder="Description"
          className="form-textarea"
          maxLength={500}
        />
      </div>
      <div className="grid grid-cols-3 text-base text-tertiary">
        <ServerSelect servers={servers} server={server} setServer={setServer} />
      </div>
    </StyledDialog>
  )
}
