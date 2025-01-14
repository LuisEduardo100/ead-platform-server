import { EpisodeInstance } from "../models/Episode.js"
import { User, UserCreationAttributes } from "../models/User.js"
import bcrypt from 'bcrypt'
function filterLastEpisodeFromEachCourse(episodes: EpisodeInstance[]) {
  const coursesOnList: number[] = []

  const lastEpisodes = episodes.reduce((currentList, episode) => {
    if (!coursesOnList.includes(episode.courseId)) {
      coursesOnList.push(episode.courseId)
      currentList.push(episode)
      return currentList
    }

    const episodeFromSameCourse = currentList.find(e => e.courseId === episode.courseId)

    if (episodeFromSameCourse!.order > episode.order) {
      return currentList
    }

    const listWithoutEpisodeFromSameCourse = currentList.filter(e => e.courseId !== episode.courseId)
    listWithoutEpisodeFromSameCourse.push(episode)

    return listWithoutEpisodeFromSameCourse
  }, [] as EpisodeInstance[])

  return lastEpisodes
}

export const userService = {
  findByEmail: async (email: string) => {
    const user = await User.findOne({
      where: {
        email
      }
    })
    return user
  },
  create: async (attributes: UserCreationAttributes) => {
    const user = await User.create(attributes)
    return user
  },
  update: async (
    id: string | number,
    values: {
      firstName?: string,
      lastName?: string,
      serie?: string,
      phone?: string,
      birth?: Date,
      email?: string
    }
  ) => {
    const { firstName, lastName, serie, phone, birth, email } = values

    const [affectedRows, updatedUsers] = await User.update({
      firstName,
      lastName,
      serie,
      phone,
      birth,
      email
    }, {
      where: { id },
      returning: true
    })

    return updatedUsers[0]
  },
  updatePassword: async (id: string | number, password: string) => {
    const [affectedRows, updatedUsers] = await User.update(
      { password },
      {
        where: { id },
        individualHooks: true,
        returning: true
      })

    return updatedUsers[0]
  },
  getKeepWatchingList: async (id: string | number) => {
    const userWithWatchingEpisodes = await User.findByPk(id, {
      attributes: [],
      include: {
        association: 'Episodes',
        include: [{
          association: 'Course'
        }],
        through: {
          as: 'watchTime'
        }
      }
    })

    if (!userWithWatchingEpisodes) {
      throw new Error('Usuário não encontrado')
    }

    const keepWatchingList = filterLastEpisodeFromEachCourse(userWithWatchingEpisodes.Episodes!)
    // @ts-ignore
    keepWatchingList.sort((a, b) => a.watchTime.updatedAt < b.watchTime.updatedAt ? 1 : -1)
    return keepWatchingList
  },
  updateProfilePicture: async (id: string | number, profilePicturePath: string) => {
    const [affectedRows, updatedUsers] = await User.update(
      { profileImage: profilePicturePath },
      { where: { id }, returning: true }
    );
    return updatedUsers[0];
  },
}
