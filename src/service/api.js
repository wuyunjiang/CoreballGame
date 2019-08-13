import config from '../util/config.js'

const { apiPrefix } = config

export default {
  signature: `${apiPrefix}/weapp/wx/signature`,
  user: `${apiPrefix}/weapp/wx/user`,
  game: `${apiPrefix}/weapp/game`,
  share: `${apiPrefix}/weapp/game/share`,
}