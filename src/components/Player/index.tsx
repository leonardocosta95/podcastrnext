import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import styles from './styles.module.scss';
import { convertDurationToTimeScriptString } from '../../utils/convertDurationToTimeScriptString';

export function Player() {
const audioRef = useRef<HTMLAudioElement>(null)
const [progress, setProgress] = useState(0)

const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping, 
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShupple,
    setIsPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState
} = usePlayer()

useEffect(() => {
    if(!audioRef.current) {
        return
    }

    if (isPlaying) {
        audioRef.current.play()
    } else {
        audioRef.current.pause()
    }
}, [isPlaying])

function setupProgressListener() {
    audioRef.current.currentTime = 0

    audioRef.current.addEventListener('timeupdate', () => {
        setProgress(Math.floor(audioRef.current.currentTime))
    })
}

function handleSeek (amount: number) {
    audioRef.current.currentTime = amount
    setProgress(amount)
}

function handleEpisodeEnded () {
    if (hasNext) {
        playNext()
    } else {
        clearPlayerState()
    }
}

const episode = episodeList[currentEpisodeIndex]

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando agora</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image 
                    width={592} 
                    height={592} 
                    src={episode.thumbnail} 
                    objectFit="cover"/>
                    <strong>{episode.title}</strong>
                    <p>{episode.members}</p>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeScriptString(progress)}</span>
                    <div className={styles.slider}>
                        { episode ? (
                            <Slider
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle = {{backgroundColor: '#04d361'}}
                            railStyle={{backgroundColor: '#9f75ff'}}
                            handleStyle={{borderColor: '#04d361', borderWidth: 3}}
                            />
                        ) : (
                            <div className={styles.emptySlider}/>
                        ) }
                    </div>
                    <span>{convertDurationToTimeScriptString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio src={episode.url}
                    ref={audioRef}
                    autoPlay
                    loop={isLooping}
                    onEnded={handleEpisodeEnded}
                    onPlay={() => setIsPlayingState(true)}
                    onPause={() => setIsPlayingState(false)}
                    onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}> 

                    <button 
                    type="button" 
                    disabled={!episode || episodeList.length === 1}
                    onClick={toggleShupple}
                    className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="Aleatório"/>
                    </button>

                    <button type="button" disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" onClick={playPrevious}/>
                    </button>

                    <button type="button" 
                    className={styles.playButton} 
                    disabled={!episode}
                    onClick={togglePlay}>

                        {isPlaying 
                        ? <img src="/pause.svg" alt="Pause" />
                        : <img src="/play.svg" alt="Tocar" />
                    }
                    </button>

                    <button type="button" disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" onClick={playNext} />
                    </button>

                    <button 
                    type="button" 
                    disabled={!episode} 
                    onClick={toggleLoop}
                    className={isLooping ? styles.isActive : ''}>
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>

                </div>
            </footer>

        </div>
    )
}