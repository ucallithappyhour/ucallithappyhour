"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const songs = [
  { title: "Rotten Apple", artist: "Alice In Chains" },
  { title: "Nutshell", artist: "Alice In Chains" },
  { title: "Got Me Wrong", artist: "Alice In Chains" },
  { title: "Rain When I Die", artist: "Alice In Chains" },
  { title: "Down In A Hole", artist: "Alice In Chains" },
  { title: "Would?", artist: "Alice In Chains" },
  { title: "Man In The Box", artist: "Alice In Chains" },
  { title: "What The Hell Have I", artist: "Alice In Chains" },
  { title: "Your Decision", artist: "Alice In Chains" },
  { title: "Midnight Rider", artist: "Allman Bros. Band" },
  { title: "Soulshine", artist: "Allman Bros. Band" },
  { title: "No One To Run With", artist: "Allman Bros. Band" },
  { title: "Statesboro Blues", artist: "Allman Bros. Band" },
  { title: "Blue Sky", artist: "Allman Bros. Band" },
  { title: "Ramblin' Man", artist: "Allman Bros. Band" },
  { title: "Ain't Wastin' Time No More", artist: "Allman Bros. Band" },
  { title: "One Way Out", artist: "Allman Bros. Band" },
  { title: "Sister Golden Hair", artist: "America" },
  { title: "The Dreamer", artist: "Amigo The Devil" },
  { title: "House of the Rising Sun", artist: "The Animals" },

  { title: "Silver, Blue & Gold", artist: "Bad Company" },
  { title: "Seagull", artist: "Bad Company" },
  { title: "Feel Like Makin' Love", artist: "Bad Company" },
  { title: "Shooting Star", artist: "Bad Company" },

  { title: "Up On Cripple Creek", artist: "The Band" },
  { title: "The Weight", artist: "The Band" },
  { title: "Ophelia", artist: "The Band" },
  { title: "The Night They Drove Old Dixie Down", artist: "The Band" },
  { title: "Atlantic City", artist: "The Band" },
  { title: "When I Paint My Masterpiece", artist: "The Band/Dylan" },

  { title: "A Little Help From My Friends", artist: "The Beatles" },
  { title: "Something", artist: "The Beatles" },
  { title: "Here Comes The Sun", artist: "The Beatles" },
  { title: "Eleanor Rigby", artist: "The Beatles" },
  { title: "Rocky Raccoon", artist: "The Beatles" },
  { title: "Don't Let Me Down", artist: "The Beatles" },
  { title: "Let It Be", artist: "The Beatles" },
  { title: "Come Together", artist: "The Beatles" },
  { title: "While My Guitar Gently Weeps", artist: "The Beatles" },

  { title: "She Talks To Angels", artist: "Black Crowes" },
  { title: "Seein' Things", artist: "Black Crowes" },
  { title: "Sometimes Salvation", artist: "Black Crowes" },
  { title: "Hard To Handle", artist: "Black Crowes" },
  { title: "Remedy", artist: "Black Crowes" },

  { title: "In This River", artist: "Black Label Society" },
  { title: "Spoke In The Wheel", artist: "Black Label Society" },

  { title: "War Pigs", artist: "Black Sabbath" },
  { title: "Planet Caravan", artist: "Black Sabbath" },

  { title: "Can't Find My Way Home", artist: "Blind Faith" },
  { title: "Wanted Dead or Alive", artist: "Bon Jovi" },
  { title: "One Toke Over The Line", artist: "Brewer & Shipley" },
  { title: "Key To The Highway", artist: "Big Bill Broonzy" },
  { title: "Doctor, My Eyes", artist: "Jackson Browne" },
  { title: "For What It's Worth", artist: "Buffalo Springfield" },
  { title: "I'll Feel A Whole Lot Better", artist: "Byrds" },
  { title: "Turn, Turn, Turn", artist: "Byrds" },
  { title: "It's All Over Now, Baby Blue", artist: "Byrds" },
  { title: "After Midnight", artist: "J.J. Cale" },
  { title: "Cocaine", artist: "J.J. Cale / Eric Clapton" },
  { title: "Call Me The Breeze", artist: "J.J. Cale / Lynyrd Skynyrd" },

  { title: "Folsom Prison Blues", artist: "Johnny Cash" },
  { title: "Ring Of Fire", artist: "Johnny Cash" },

  { title: "That Spirit Of Christmas", artist: "Ray Charles" },
  { title: "I Got A Woman", artist: "Ray Charles" },

  { title: "Badge", artist: "Eric Clapton" },
  { title: "Let It Rain", artist: "Eric Clapton" },
  { title: "Lay Down Sally", artist: "Eric Clapton" },
  { title: "It's In The Way That You Use It", artist: "Eric Clapton" },

  { title: "Should I Stay Or Should I Go", artist: "The Clash" },
  { title: "The Scientist", artist: "Coldplay" },
  { title: "Seasons", artist: "Chris Cornell" },

  { title: "My Own Prison", artist: "Creed" },
  { title: "Higher", artist: "Creed" },

  { title: "Have You Ever Seen The Rain", artist: "Creedence" },
  { title: "Bad Moon Rising", artist: "Creedence" },
  { title: "Proud Mary", artist: "Creedence" },
  { title: "Born On The Bayou", artist: "Creedence" },
  { title: "Lodi", artist: "Creedence" },
  { title: "Who'll Stop The Rain", artist: "Creedence" },

  { title: "Bad Leroy Brown", artist: "Jim Croce" },
  { title: "Ohio", artist: "CSN&Y" },

  { title: "Edie", artist: "The Cult" },
  { title: "Sweet Soul Sister", artist: "The Cult" },
  { title: "Fire Woman", artist: "The Cult" },

  { title: "Country Roads", artist: "John Denver" },
  { title: "Enjoy The Silence", artist: "Depeche Mode" },
  { title: "Layla", artist: "Derek & The Dominos" },
  { title: "Sultans Of Swing", artist: "Dire Straits" },
  { title: "Jolene", artist: "Dolly Parton" },

  { title: "China Grove", artist: "Doobie Bros." },
  { title: "Blackwater", artist: "Doobie Bros." },
  { title: "Listen To The Music", artist: "Doobie Bros." },
  { title: "Long Train Runnin'", artist: "Doobie Bros." },

  { title: "Tell All The People", artist: "The Doors" },
  { title: "L.A. Woman", artist: "The Doors" },
  { title: "Roadhouse Blues", artist: "The Doors" },
  { title: "Peace Frog", artist: "The Doors" },

  { title: "Hungry Like The Wolf", artist: "Duran Duran" },

  { title: "Like A Rolling Stone", artist: "Bob Dylan" },
  { title: "Shelter From The Storm", artist: "Bob Dylan" },
  { title: "Girl From The North Country", artist: "Bob Dylan" },
  { title: "All Along The Watchtower", artist: "Bob Dylan" },
  { title: "The Times They Are A-Changin'", artist: "Bob Dylan" },
  { title: "Forever Young", artist: "Bob Dylan" },
  { title: "Blowin' In The Wind", artist: "Bob Dylan" },
  { title: "I Shall Be Released", artist: "Bob Dylan" },
  { title: "It Ain't Me Babe", artist: "Bob Dylan" },
  { title: "Tangled Up In Blue", artist: "Bob Dylan" },
  { title: "Knockin' On Heaven's Door", artist: "Bob Dylan" },

  { title: "Take It Easy", artist: "Eagles" },
  { title: "Hotel California", artist: "Eagles" },
  { title: "Take It To The Limit", artist: "Eagles" },

  { title: "Gold Dust Woman", artist: "Fleetwood Mac" },
  { title: "Dreams", artist: "Fleetwood Mac" },

  { title: "Six Days On The Road", artist: "Flying Burrito Bros." },

  { title: "All Right Now", artist: "Free" },
  { title: "Ride On A Pony", artist: "Free" },

  { title: "Let's Get It On", artist: "Marvin Gaye" },

  { title: "32-20 Blues", artist: "Gov't Mule" },

  { title: "Ripple", artist: "Grateful Dead" },
  { title: "Touch Of Grey", artist: "Grateful Dead" },

  { title: "Patience", artist: "Guns N' Roses" },
  { title: "Sweet Child O' Mine", artist: "Guns N' Roses" },
  { title: "Used To Love Her", artist: "Guns N' Roses" },

  { title: "Little Wing", artist: "Jimi Hendrix" },
  { title: "Angel", artist: "Jimi Hendrix" },
  { title: "The Wind Cries Mary", artist: "Jimi Hendrix" },

  { title: "Boys Of Summer", artist: "Don Henley" },
  { title: "That'll Be The Day", artist: "Buddy Holly" },

  { title: "30 Days In The Hole", artist: "Humble Pie" },

  { title: "Radioactive", artist: "Imagine Dragons" },

  { title: "Dust My Blues", artist: "Elmore James" },

  { title: "Good Hearted Woman", artist: "Waylon Jennings" },
  { title: "Dukes Of Hazzard", artist: "Waylon Jennings" },

  { title: "Locomotive Breath", artist: "Jethro Tull" },
  { title: "Tiny Dancer", artist: "Elton John" },

  { title: "Goin' Down", artist: "Freddie King" },

  { title: "Hard Luck Woman", artist: "KISS" },
  { title: "Cold Gin", artist: "KISS" },
  { title: "Kashmir", artist: "Led Zeppelin" },
  { title: "Tangerine", artist: "Led Zeppelin" },
  { title: "You Shook Me", artist: "Led Zeppelin" },
  { title: "Immigrant Song", artist: "Led Zeppelin" },
  { title: "Thank You", artist: "Led Zeppelin" },
  { title: "Hey, Hey What Can I Do", artist: "Led Zeppelin" },
  { title: "Good Times, Bad Times", artist: "Led Zeppelin" },
  { title: "Ramble On", artist: "Led Zeppelin" },
  { title: "What Is And What Should Never Be", artist: "Led Zeppelin" },

  { title: "Stand By Me", artist: "John Lennon" },
  { title: "Imagine", artist: "John Lennon" },
  { title: "Jealous Guy", artist: "John Lennon" },
  { title: "Cold Turkey", artist: "John Lennon" },

  { title: "Long Tall Sally", artist: "Little Richard" },

  { title: "All I Can Do Is Write About It", artist: "Lynyrd Skynyrd" },
  { title: "Tuesday's Gone", artist: "Lynyrd Skynyrd" },
  { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd" },
  { title: "Simple Man", artist: "Lynyrd Skynyrd" },
  { title: "Ballad Of Curtis Lowe", artist: "Lynyrd Skynyrd" },

  { title: "River Of Deceit", artist: "Mad Season" },

  { title: "Can't You See", artist: "Marshall Tucker Band" },

  { title: "Jet Airliner", artist: "Steve Miller Band" },
  { title: "The Joker", artist: "Steve Miller" },
  { title: "Take The Money and Run", artist: "Steve Miller Band" },

  { title: "Chloe Dancer / Crown of Thorns", artist: "Mother Love Bone" },
  { title: "Bone China", artist: "Mother Love Bone" },
  { title: "Stargazer", artist: "Mother Love Bone" },

  { title: "Mississippi Queen", artist: "Mountain" },

  { title: "On The Road Again", artist: "Willie Nelson" },

  { title: "Come As You Are", artist: "Nirvana" },

  { title: "Wonderwall", artist: "Oasis" },
  { title: "Don't Look Back In Anger", artist: "Oasis" },

  { title: "Elderly Woman", artist: "Pearl Jam" },
  { title: "Black", artist: "Pearl Jam" },
  { title: "Garden", artist: "Pearl Jam" },
  { title: "Alive", artist: "Pearl Jam" },

  { title: "Learning To Fly", artist: "Tom Petty" },
  { title: "I Won't Back Down", artist: "Tom Petty" },
  { title: "Mary Jane's Last Dance", artist: "Tom Petty" },
  { title: "Breakdown", artist: "Tom Petty" },
  { title: "Yer So Bad", artist: "Tom Petty" },
  { title: "Into The Great Wide Open", artist: "Tom Petty" },
  { title: "You Got Lucky", artist: "Tom Petty" },

  { title: "In The Midnight Hour", artist: "Wilson Pickett" },

  { title: "Pigs On The Wing 1 & 2", artist: "Pink Floyd" },
  { title: "Time", artist: "Pink Floyd" },
  { title: "Fearless", artist: "Pink Floyd" },
  { title: "Wish You Were Here", artist: "Pink Floyd" },
  { title: "Learning To Fly", artist: "Pink Floyd" },
  { title: "Mother", artist: "Pink Floyd" },
  { title: "Comfortably Numb", artist: "Pink Floyd" },
  { title: "Brain Damage / Eclipse", artist: "Pink Floyd" },

  { title: "Ship Of Fools", artist: "Robert Plant" },

  { title: "Never Been To Spain", artist: "Elvis Presley" },
  { title: "That's Alright Mama", artist: "Elvis Presley" },

  { title: "Whiter Shade Of Pale", artist: "Procol Harum" },
  { title: "Amie", artist: "Pure Prairie League" },

  { title: "Fat Bottomed Girls", artist: "Queen" },
  { title: "It's Late", artist: "Queen" },
  { title: "Crazy Little Thing Called Love", artist: "Queen" },

  { title: "In The Fade", artist: "Queens Of The Stone Age" },

  { title: "Creep", artist: "Radiohead" },
  { title: "Karma Police", artist: "Radiohead" },

  { title: "Hard To Handle", artist: "Otis Redding" },

  { title: "East Bound & Down", artist: "Jerry Reed" },

  { title: "Who's Loving You", artist: "Smokey Robinson" },

  { title: "Angie", artist: "Rolling Stones" },
  { title: "Jumpin' Jack Flash", artist: "Rolling Stones" },
  { title: "Street Fighting Man", artist: "Rolling Stones" },
  { title: "Gimme Shelter", artist: "Rolling Stones" },
  { title: "Get Off My Cloud", artist: "Rolling Stones" },
  { title: "Dead Flowers", artist: "Rolling Stones" },
  { title: "Miss You", artist: "Rolling Stones" },
  { title: "Honky Tonk Women", artist: "Rolling Stones" },
  { title: "Emotional Rescue", artist: "Rolling Stones" },
  { title: "Monkey Man", artist: "Rolling Stones" },
];
type Song = {
  title: string;
  artist: string;
};

export default function RequestSongPage() {
  const [query, setQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [mode, setMode] = useState<"tonight" | "future">("tonight");
  const [futureTitle, setFutureTitle] = useState("");
  const [futureArtist, setFutureArtist] = useState("");
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState<"tonight" | "future" | null>(null);

const matches = useMemo(() => {
  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]/g, "");

  const q = normalize(query.trim());

  if (!q) return songs;

  return songs.filter((song) =>
    normalize(`${song.title} ${song.artist}`).includes(q)
  );
}, [query]);

  const showFutureSuggestion = query.trim().length > 0 && matches.length === 0;

  function resetToCatalog() {
    setSelectedSong(null);
    setMode("tonight");
    setFutureTitle("");
    setFutureArtist("");
    setName("");
    setDedication("");
    setQuery("");
    setLoading(false);
    setSuccessMode(null);
  }

  function openTonightRequest(song: Song) {
    setSelectedSong(song);
    setMode("tonight");
    setName("");
    setDedication("");
    setLoading(false);
    setSuccessMode(null);
  }

  function openFutureSuggestion() {
    setSelectedSong(null);
    setMode("future");
    setFutureTitle(query.trim());
    setFutureArtist("");
    setName("");
    setDedication("");
    setLoading(false);
    setSuccessMode(null);
  }

  async function submitRequest() {
    const title = mode === "tonight" ? selectedSong?.title : futureTitle.trim();
    const artist =
      mode === "tonight"
        ? selectedSong?.artist
        : futureArtist.trim() || "Unknown Artist";

    if (!title) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("song_requests").insert({
        song: title,
        artist,
        requester_name: name.trim() || null,
        dedication: dedication.trim() || null,
        status: "pending",
        request_type: mode
      });

      if (error) {
        alert("Request did not send: " + error.message);
        setLoading(false);
        return;
      }

      setSuccessMode(mode);
    } catch (err) {
      alert("Request did not send. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", padding: 40, background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 550px) 1fr", gap: 40, alignItems: "start" }}>
        <div>
          <h1>Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.</h1>
          <p>Search by song or artist.</p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song or artist..."
            style={{ width: "100%", maxWidth: 500, padding: 14, fontSize: 18, borderRadius: 8, marginTop: 20 }}
          />

          <div style={{ marginTop: 25, maxWidth: 500 }}>
            {matches.map((song) => (
              <button
                key={`${song.title}-${song.artist}`}
                onClick={() => openTonightRequest(song)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: 14, marginBottom: 10, fontSize: 17, borderRadius: 8, background: "#f3f3f3", color: "#000", cursor: "pointer" }}
              >
                <strong>{song.title}</strong>
                <br />
                <span>{song.artist}</span>
              </button>
            ))}

            {showFutureSuggestion && (
              <div style={{ background: "#181818", padding: 18, borderRadius: 12, border: "1px solid #333" }}>
                <p>No matching songs found.</p>
                <p>Want Brian to consider this for a future show?</p>

                <button
                  onClick={openFutureSuggestion}
                  style={{ padding: "14px 20px", fontSize: 17, borderRadius: 8, background: "#ffd84d", color: "#000", cursor: "pointer" }}
                >
                  Suggest for Future Performance
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, textAlign: "center" }}>
          <img
            src="/brian-logo.jpg"
            alt="Brian Quinn Logo"
            style={{ width: "100%", maxWidth: 320, marginBottom: 30 }}
          />

          <h2 style={{ marginBottom: 10 }}>Brian Quinn</h2>

          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            Screwballs • Fridays • 5–7 PM
          </p>

          <p style={{ maxWidth: 320, lineHeight: 1.6, opacity: 0.75 }}>
            Request tonight&apos;s songs.
            <br />
            Influence tomorrow&apos;s setlist.
          </p>

          <a
            href="https://venmo.com/Brian-Quinn-41"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ffd84d", fontSize: 20, textDecoration: "none", fontWeight: "bold", marginTop: 18 }}
          >
            💵 Tip Brian
          </a>
        </div>
      </div>

      {(selectedSong || mode === "future") && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 }}>
          <div style={{ width: "100%", maxWidth: 520, background: "#181818", color: "#fff", padding: 24, borderRadius: 16, border: "1px solid #333" }}>
            <button
              onClick={resetToCatalog}
              style={{ float: "right", fontSize: 22, background: "transparent", color: "#fff", border: 0, cursor: "pointer" }}
            >
              ×
            </button>

            {successMode ? (
              <>
                <h2>{successMode === "tonight" ? "Request sent!" : "Suggestion sent!"}</h2>

                <p>
                  {successMode === "tonight"
                    ? "Brian received your request."
                    : "Brian received your future song suggestion."}
                </p>

                <a
                  href="https://venmo.com/Brian-Quinn-41"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#ffd84d", fontSize: 20 }}
                >
                  Tip Brian on Venmo
                </a>

                <br />
                <br />

                <button
                  onClick={resetToCatalog}
                  style={{ padding: "12px 18px", fontSize: 16, borderRadius: 8, cursor: "pointer" }}
                >
                  Back to Catalog
                </button>
              </>
            ) : (
              <>
                <h2>{mode === "tonight" ? "Request for Tonight" : "Suggest for Future Show"}</h2>

                {mode === "tonight" && selectedSong ? (
                  <>
                    <h3>{selectedSong.title}</h3>
                    <p>{selectedSong.artist}</p>
                  </>
                ) : (
                  <>
                    <input
                      value={futureTitle}
                      onChange={(e) => setFutureTitle(e.target.value)}
                      placeholder="Song title"
                      style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
                    />

                    <input
                      value={futureArtist}
                      onChange={(e) => setFutureArtist(e.target.value)}
                      placeholder="Artist name optional"
                      style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
                    />
                  </>
                )}

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name optional"
                  style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
                />

                <textarea
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  placeholder="Dedication or message optional"
                  rows={4}
                  style={{ width: "100%", padding: 14, fontSize: 18, borderRadius: 8, marginBottom: 12 }}
                />

                <button
                  onClick={submitRequest}
                  disabled={loading}
                  style={{ padding: "14px 22px", fontSize: 18, borderRadius: 8, cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading
                    ? "Sending..."
                    : mode === "tonight"
                    ? "Submit Tonight's Request"
                    : "Suggest for Future Show"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}