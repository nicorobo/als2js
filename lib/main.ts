import pako from 'pako'
import xml2js from 'xml2js'
import { palette } from './palette'

const xmlParser = new xml2js.Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
})

type ArrangementClip = {
  name: string
  start: number
  end: number
  color: string
}

export type Track = {
  id: number
  name: string
  color: string
  type: 'midi' | 'audio'
  clips: ArrangementClip[]
}

export class AbletonParser {
  version: string
  private rawSet: any

  constructor(rawFile: any) {
    console.log(rawFile)
    this.version = rawFile['Ableton']['$']['Creator']
    this.rawSet = rawFile['Ableton']['LiveSet'][0]
  }
  tracks = (): Track[] => {
    return this.getTracks()
  }
  private getRawTracks = () => {
    return this.rawSet['Tracks'][0]['$$']
  }
  private getTracks = (): Track[] => {
    const rawTracks = this.getRawTracks()
    return rawTracks
      .map(this.processRawTrack)
      .filter((t: Track | null) => t !== null) as Track[]
  }
  private getRawTrackName = (track: any): string => {
    return track['Name'][0]['EffectiveName'][0]['$']['Value']
  }

  private getRawTrackId = (track: any): number => {
    return +track['$']['Id']
  }

  private getRawColor = (entity: any): string => {
    const colorId = +entity['Color'][0]['$']['Value']
    return palette[colorId]
  }

  private getRawClipEnd = (clip: any): number => {
    return +clip['CurrentEnd'][0]['$']['Value']
  }

  private getRawClipStart = (clip: any): number => {
    return +clip['CurrentStart'][0]['$']['Value']
  }

  private getRawClipName = (clip: any): string => {
    return clip['Name'][0]['$']['Value']
  }

  private processRawTrack = (track: any): Track | null => {
    const type = track['#name']
    if (type === 'MidiTrack') {
      return {
        id: this.getRawTrackId(track),
        type: 'midi',
        name: this.getRawTrackName(track),
        color: this.getRawColor(track),
        clips: this.getMidiTrackArrangementClips(track),
      }
    } else if (type === 'AudioTrack') {
      return {
        id: this.getRawTrackId(track),
        type: 'audio',
        name: this.getRawTrackName(track),
        color: this.getRawColor(track),
        clips: this.getAudioTrackArrangementClips(track),
      }
    } else {
      // We currently aren't processing Return or Group tracks
      return null
    }
  }

  private getRawMidiTrackArrangementClips = (track: any): any[] => {
    return track['DeviceChain'][0]['MainSequencer'][0]['ClipTimeable'][0][
      'ArrangerAutomation'
    ][0]['Events'][0]['MidiClip']
  }

  private getRawAudioTrackArrangementClips = (track: any): any[] => {
    return track['DeviceChain'][0]['MainSequencer'][0]['Sample'][0][
      'ArrangerAutomation'
    ][0]['Events'][0]['AudioClip']
  }

  private processRawTrackArrangementClip = (clip: any): ArrangementClip => {
    const name = this.getRawClipName(clip)
    const start = this.getRawClipStart(clip)
    const end = this.getRawClipEnd(clip)
    const color = this.getRawColor(clip)
    return { name, start, end, color }
  }

  private getMidiTrackArrangementClips = (track: any): ArrangementClip[] => {
    const clips = this.getRawMidiTrackArrangementClips(track)
    return clips.map(this.processRawTrackArrangementClip)
  }

  private getAudioTrackArrangementClips = (track: any): ArrangementClip[] => {
    const clips = this.getRawAudioTrackArrangementClips(track)
    return clips.map(this.processRawTrackArrangementClip)
  }

  //   private getTracks() {

  //   }

  static async parseAbletonFile(file: File): Promise<AbletonParser> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result
        if (!result || typeof result === 'string') {
          return reject(new Error('No result'))
        }
        const unzipped = pako.ungzip(new Uint8Array(result), {
          to: 'string',
        })
        xmlParser.parseString(unzipped, (err, result) => {
          if (err) {
            return reject(err)
          }
          console.log(result)
          return resolve(new AbletonParser(result))
        })
      }
      reader.onerror = (e) => reject(new Error('Error reading the file:' + e))
    })
  }
}
