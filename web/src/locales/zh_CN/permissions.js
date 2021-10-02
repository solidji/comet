import { ServerPermission } from '@/graphql/hooks'

export const permissions = {
  server: {
    // General
    [ServerPermission.ManageChannels]: {
      title: 'Manage Channels',
      description: '允许成员创建、编辑、删除频道.'
    },
    [ServerPermission.ManageServer]: {
      title: 'Manage Roles',
      description:
        '允许成员创建新角色并编辑或删除比ta角色最高等级低的角色. 也允许成员修改ta可以访问的单个频道的权限.'
    },
    [ServerPermission.ManageServer]: {
      title: 'Manage Planet',
      description:
        "允许成员修改星球的名字、描述、图标、头图."
    },

    // Channels
    [ServerPermission.SendMessages]: {
      title: 'Send Messages',
      description: '允许成员在文字频道发送信息.'
    },
    [ServerPermission.RestrictedChannels]: {
      title: 'Send Messages in Restricted Channels',
      description:
        '允许成员在受限文字频道发送信息.'
    },
    [ServerPermission.PrivateChannels]: {
      title: 'Use Private Channels',
      description:
        '允许成员查看私密文字频道并发送信息.'
    },
    [ServerPermission.ManageMessages]: {
      title: 'Manage Messages',
      description:
        '允许成员删除或pin其他人的消息.'
    },

    // Posts
    [ServerPermission.ManagePosts]: {
      title: 'Manage Posts',
      description: '允许成员pin和删除帖子.'
    },

    // Comments
    [ServerPermission.ManageComments]: {
      title: 'Manage Comments',
      description: '允许成员pin和删除回复.'
    },

    // Folders
    [ServerPermission.ManageFolders]: {
      title: 'Manage Folders',
      description: '允许成员新建、删除、编辑文件夹.'
    },
    [ServerPermission.AddPostToFolder]: {
      title: 'Add Posts to Folders',
      description: '允许成员往文件夹添加和移除帖子.'
    },

    // Other
    [ServerPermission.DisplayRoleSeparately]: {
      title: 'Display Role Separately',
      description:
        '此角色成员在用户列表中会单独列出.'
    },
    [ServerPermission.Admin]: {
      title: 'Administrator',
      description: `此角色成员拥有所有权限.`
    },

    [ServerPermission.ManageUsers]: {
      title: 'Manage Users',
      description: `封号与踢人权限.`
    }
  }
}
