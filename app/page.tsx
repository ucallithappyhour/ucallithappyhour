"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Artist = {
  artist_slug: string;
  artist_name: string | null;
  genres: string | null;
  logo_url: string | null;
};

type Gig = {
  artist_slug: string;
  venue_name: string | null;
  gig_date: string | null;
  start_time: string | null;
  end_time: string | null;
  recurring_type: string | null;
};

function fallbackLogo(slug: string) {
  if (slug === "brian-quinn") return "/brian-logo.jpg";
  if (slug === "corey-and-friends") return "/corey-friends-logo.jpg";
  return "";
}

function artistButtonName(name: string) {
  const firstName = name.split(" ")[0];
  return `Enter ${firstName}'s Page`;
}

function formatGigDate(dateValue: string | null) {
  if (!dateValue) return "Date TBD";

  const date = new Date(`${dateValue}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  return new Date(
    2000,
    0,
    1,
    hour,
    Number(minutes)
  ).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatGigTime(
  start: string | null,
  end: string | null
) {
  if (!start && !end) return "Time TBD";
  if (start && !end) return formatTime(start);
  if (!start && end) return formatTime(end);

  return `${formatTime(start)} - ${formatTime(end)}`;
}

function gigDetails(gig: Gig | undefined) {
  if (!gig) return "Next gig TBD";

  const venue =
    gig.venue_name || "Venue TBD";

  const date =
    formatGigDate(gig.gig_date);

  const time =
    formatGigTime(
      gig.start_time,
      gig.end_time
    );

  return `${venue} • ${date} • ${time}`;
}


/***************************************************************
 * LOCAL DATE HELPERS
 ***************************************************************/

function getLocalDateString() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function dateToLocalString(
  date: Date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/***************************************************************
 * CALCULATE NEXT OCCURRENCE
 *
 * Handles:
 *   One-Time
 *   Weekly
 *   Monthly
 ***************************************************************/

function getNextGigDate(
  gig: Gig
): string | null {

  if (!gig.gig_date) {
    return null;
  }


  const todayString =
    getLocalDateString();


  const original =
    new Date(
      `${gig.gig_date}T12:00:00`
    );


  const today =
    new Date(
      `${todayString}T12:00:00`
    );


  const recurring =
    String(
      gig.recurring_type || ""
    )
      .trim()
      .toLowerCase();


  /***********************************************************
   * ONE-TIME
   ***********************************************************/

  if (
    !recurring ||
    recurring === "one-time" ||
    recurring === "one time" ||
    recurring === "once"
  ) {

    return gig.gig_date >= todayString
      ? gig.gig_date
      : null;
  }


  /***********************************************************
   * WEEKLY
   ***********************************************************/

  if (
    recurring.includes("week")
  ) {

    const next =
      new Date(original);


    while (
      next < today
    ) {

      next.setDate(
        next.getDate() + 7
      );
    }


    return dateToLocalString(
      next
    );
  }


  /***********************************************************
   * MONTHLY
   ***********************************************************/

  if (
    recurring.includes("month")
  ) {

    const originalDay =
      original.getDate();


    let next =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        originalDay,
        12,
        0,
        0
      );


    if (
      next < today
    ) {

      next =
        new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          originalDay,
          12,
          0,
          0
        );
    }


    return dateToLocalString(
      next
    );
  }


  /***********************************************************
   * FALLBACK
   ***********************************************************/

  return gig.gig_date >= todayString
    ? gig.gig_date
    : null;
}


function isToday(
  dateValue: string | null
) {

  if (!dateValue) {
    return false;
  }

  return (
    dateValue ===
    getLocalDateString()
  );
}


function todayGigDetails(
  gig: Gig | undefined
) {

  if (!gig) {
    return "";
  }

  const venue =
    gig.venue_name || "Venue TBD";

  const time =
    formatGigTime(
      gig.start_time,
      gig.end_time
    );

  return `${venue} • ${time}`;
}


/***************************************************************
 * HOME
 ***************************************************************/

export default function Home() {

  const [query, setQuery] =
    useState("");

  const [artists, setArtists] =
    useState<Artist[]>([]);

  const [
    gigsByArtist,
    setGigsByArtist
  ] =
    useState<
      Record<string, Gig>
    >({});

  const [
    todayGig,
    setTodayGig
  ] =
    useState<Gig | null>(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    message,
    setMessage
  ] =
    useState("");


  /*************************************************************
   * LOAD ARTISTS + GIGS
   *************************************************************/

  async function loadArtistsAndGigs() {

    setLoading(true);
    setMessage("");


    /***********************************************************
     * ACTIVE ARTISTS
     ***********************************************************/

    const {
      data: artistData,
      error: artistError
    } =
      await supabase
        .from("artists")
        .select(
          "artist_slug, artist_name, genres, logo_url"
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "artist_name",
          {
            ascending: true
          }
        );


    if (artistError) {

      setMessage(
        "Could not load artists right now."
      );

      setArtists([]);
      setLoading(false);

      return;
    }


    const activeArtists =
      artistData || [];


    setArtists(
      activeArtists
    );


    const activeArtistSlugs =
      activeArtists.map(
        artist =>
          artist.artist_slug
      );


    /***********************************************************
     * LOAD ALL GIG RECORDS FOR ACTIVE ARTISTS
     *
     * IMPORTANT:
     * Do NOT filter .gte("gig_date", today) here.
     *
     * Recurring gigs may have an OLD original gig_date even
     * though their next occurrence is today or in the future.
     ***********************************************************/

    const {
      data: gigData,
      error: gigError
    } =
      await supabase
        .from("gigs")
        .select(
          "artist_slug, venue_name, gig_date, start_time, end_time, recurring_type"
        )
        .in(
          "artist_slug",
          activeArtistSlugs.length > 0
            ? activeArtistSlugs
            : [""]
        );


    if (gigError) {

      setMessage(
        "Artists loaded, but upcoming gigs could not be loaded."
      );

      setGigsByArtist({});
      setTodayGig(null);
      setLoading(false);

      return;
    }


    /***********************************************************
     * EXPAND EACH RECORD TO ITS NEXT OCCURRENCE
     ***********************************************************/

    const upcomingGigs:
      Gig[] =
      [];


    (gigData || []).forEach(
      gig => {

        const nextDate =
          getNextGigDate(
            gig
          );


        if (!nextDate) {
          return;
        }


        upcomingGigs.push({
          ...gig,
          gig_date:
            nextDate
        });
      }
    );


    /***********************************************************
     * SORT BY NEXT ACTUAL DATE + START TIME
     ***********************************************************/

    upcomingGigs.sort(
      (a, b) => {

        const dateA =
          a.gig_date || "";

        const dateB =
          b.gig_date || "";


        if (
          dateA !== dateB
        ) {

          return (
            dateA.localeCompare(
              dateB
            )
          );
        }


        const timeA =
          a.start_time || "99:99";

        const timeB =
          b.start_time || "99:99";


        return (
          timeA.localeCompare(
            timeB
          )
        );
      }
    );


    /***********************************************************
     * NEXT GIG FOR EACH ARTIST
     *
     * Because upcomingGigs is already sorted,
     * first appearance for an artist = nearest gig.
     ***********************************************************/

    const nextGigs:
      Record<string, Gig> =
      {};


    let firstTodayGig:
      Gig | null =
      null;


    upcomingGigs.forEach(
      gig => {

        if (
          !nextGigs[
            gig.artist_slug
          ]
        ) {

          nextGigs[
            gig.artist_slug
          ] =
            gig;
        }


        if (
          !firstTodayGig &&
          isToday(
            gig.gig_date
          )
        ) {

          firstTodayGig =
            gig;
        }
      }
    );


    setGigsByArtist(
      nextGigs
    );

    setTodayGig(
      firstTodayGig
    );

    setLoading(false);
  }


  useEffect(() => {

    loadArtistsAndGigs();

  }, []);


  /*************************************************************
   * ARTIST LOOKUP
   *************************************************************/

  const artistBySlug =
    useMemo(
      () => {

        const lookup:
          Record<
            string,
            Artist
          > =
          {};


        artists.forEach(
          artist => {

            lookup[
              artist.artist_slug
            ] =
              artist;
          }
        );


        return lookup;
      },
      [artists]
    );


  /*************************************************************
   * SEARCH
   *************************************************************/

  const filteredArtists =
    useMemo(
      () => {

        const q =
          query
            .trim()
            .toLowerCase();


        if (!q) {
          return artists;
        }


        return artists.filter(
          artist =>

            `${
              artist.artist_name ||
              ""
            } ${
              artist.genres ||
              ""
            }`
              .toLowerCase()
              .includes(q)
        );
      },
      [
        query,
        artists
      ]
    );


  const todayArtist =
    todayGig
      ? artistBySlug[
          todayGig.artist_slug
        ]
      : null;


  const todayArtistName =
    todayArtist?.artist_name ||
    "Tonight's Artist";


  /*************************************************************
   * PAGE
   *************************************************************/

  return (

    <main className="page">

      <div className="overlay">

        <div className="container">

          <div className="hero">


            {/***************************************************
             * TONIGHT'S LIVE MUSIC
             ***************************************************/}

            {todayGig &&
              todayArtist && (

              <div
                className="event-card"
                style={{
                  marginBottom: 28,
                  border:
                    "1px solid rgba(255, 209, 102, 0.7)",
                  boxShadow:
                    "0 0 35px rgba(255, 209, 102, 0.12)",
                }}
              >

                <div
                  className="details"
                  style={{
                    color: "#ffd166",
                    fontWeight: 900
                  }}
                >
                  Tonight&apos;s Live Music
                </div>


                <p className="performer">
                  {todayArtistName}
                </p>


                <div className="details">
                  {todayGigDetails(
                    todayGig
                  )}
                </div>


                <Link
                  className="btn"
                  href={
                    `/${todayArtist.artist_slug}`
                  }
                >
                  Request Songs Now
                </Link>

              </div>
            )}


            <h1 className="title">
              Request tonight&apos;s songs. Influence tomorrow&apos;s setlist.
            </h1>


            <p
              className="tagline"
              style={{
                maxWidth: 760,
                margin:
                  "0 auto 28px",
                lineHeight: 1.7,
                fontStyle:
                  "italic",
                opacity: 0.82,
                fontSize:
                  "1.05rem",
              }}
            >
              Think TouchTunes, but for live music. Browse an artist&apos;s song
              library, send requests, and help shape the show.
            </p>


            {/***************************************************
             * AVAILABLE ARTISTS
             ***************************************************/}

            <div className="section">

              <h2
                style={{
                  color: "#ffd84d"
                }}
              >
                Available Artists
              </h2>


              <input
                value={query}
                onChange={
                  e =>
                    setQuery(
                      e.target.value
                    )
                }
                placeholder="Search artist..."
                style={{
                  width: "100%",
                  padding: 16,
                  fontSize: 18,
                  borderRadius: 10,
                  border:
                    "1px solid rgba(255,255,255,0.25)",
                  marginBottom: 22,
                }}
              />


              {message && (
                <div className="message">
                  {message}
                </div>
              )}


              {loading ? (

                <div className="event-card">

                  <p className="performer">
                    Loading artists...
                  </p>

                </div>

              ) : filteredArtists.length === 0 ? (

                <div className="event-card">

                  <p className="performer">
                    No artists found
                  </p>

                  <div className="details">
                    Try searching a different artist name.
                  </div>

                </div>

              ) : (

                filteredArtists.map(
                  artist => {

                    const name =
                      artist.artist_name ||
                      "Unnamed Artist";


                    const logo =
                      artist.logo_url ||
                      fallbackLogo(
                        artist.artist_slug
                      );


                    const nextGig =
                      gigsByArtist[
                        artist.artist_slug
                      ];


                    return (

                      <div
                        key={
                          artist.artist_slug
                        }
                        className="event-card"
                        style={{
                          position:
                            "relative",
                          minHeight:
                            190,
                          paddingRight:
                            230,
                        }}
                      >

                        <p className="performer">
                          {name}
                        </p>


                        <div className="details">
                          {gigDetails(
                            nextGig
                          )}
                        </div>


                        {artist.genres && (

                          <p
                            style={{
                              marginTop: 10,
                              opacity: 0.8
                            }}
                          >
                            {
                              artist.genres
                            }
                          </p>

                        )}


                        <Link
                          className="btn"
                          href={
                            `/${artist.artist_slug}`
                          }
                        >
                          {
                            artistButtonName(
                              name
                            )
                          }
                        </Link>


                        {logo && (

                          <div
                            style={{
                              position:
                                "absolute",
                              top: 24,
                              right: 32,
                              width: 150,
                              height: 140,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >

                            <img
                              src={logo}
                              alt={`${name} Logo`}
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "contain",
                                display:
                                  "block",
                              }}
                            />

                          </div>

                        )}

                      </div>
                    );
                  }
                )
              )}

            </div>


            {/***************************************************
             * FOR ARTISTS
             ***************************************************/}

            <div className="section">

              <h2
                style={{
                  color: "#ffd84d"
                }}
              >
                For Artists
              </h2>


              <div className="event-card">

                <p className="performer">
                  Your Fans Already Have Their Phones Out. Use Them.
                </p>


                <div
                  style={{
                    width: 80,
                    height: 4,
                    background:
                      "#ffd84d",
                    borderRadius:
                      999,
                    margin:
                      "12px 0 18px"
                  }}
                />


                <p
                  style={{
                    fontSize:
                      "1.1rem",
                    fontWeight:
                      800,
                    marginTop:
                      12
                  }}
                >
                  Turn every show into an interactive experience.
                </p>


                <p
                  style={{
                    marginTop: 14,
                    lineHeight: 1.7
                  }}
                >
                  Give fans a simple way to request songs, tip you directly, and stay
                  connected after the music stops.
                </p>


                <div
                  style={{
                    marginTop: 18,
                    lineHeight: 1.9,
                    fontSize: 14,
                    fontWeight: 700
                  }}
                >
                  <div>✓ Personalized artist page</div>
                  <div>✓ Searchable song library</div>
                  <div>✓ Live request dashboard</div>
                  <div>✓ Fan email collection</div>
                  <div>✓ Venmo & Cash App integration</div>
                  <div>✓ QR marketing kit included</div>
                  <div>✓ Audience insights & future setlist data</div>
                </div>


                <p
                  style={{
                    marginTop: 18,
                    fontStyle:
                      "italic",
                    opacity: 0.9
                  }}
                >
                  Build your audience, increase tips, and give venues a reason to bring you back.
                </p>


                <p
                  style={{
                    marginTop: 16,
                    fontWeight: 900,
                    fontSize:
                      "1.05rem",
                    color:
                      "#ffd84d"
                  }}
                >
                  🎤 One extra booking can pay for your entire setup.
                </p>


                <Link
                  className="btn"
                  href="/register"
                >
                  Apply for Artist Setup
                </Link>

              </div>


              <div
                className="actions"
                style={{
                  marginTop: 18
                }}
              >

                <Link
                  className="btn secondary"
                  href="/account"
                >
                  Artist Login
                </Link>

              </div>

            </div>

          </div>


          {/*****************************************************
           * FOR BOOKING AGENTS
           *****************************************************/}

          <div className="section">

            <h2
              style={{
                color: "#ffd84d"
              }}
            >
              For Booking Agents & Talent Buyers
            </h2>


            <div className="event-card">

              <p className="performer">
                Earn $25 Per Completed Artist Setup
              </p>


              <div
                style={{
                  width: 80,
                  height: 4,
                  background:
                    "#ffd84d",
                  borderRadius:
                    999,
                  margin:
                    "12px 0 18px"
                }}
              />


              <p
                style={{
                  fontSize:
                    "1.1rem",
                  fontWeight:
                    800,
                  marginTop:
                    12
                }}
              >
                Help artists grow their audience while earning commissions.
              </p>


              <p
                style={{
                  marginTop: 14,
                  lineHeight: 1.7
                }}
              >
                Share your referral link with artists in your roster. When they
                complete setup, they receive a discount and you earn a $25
                referral commission.
              </p>


              <div
                style={{
                  marginTop: 18,
                  lineHeight: 1.9,
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                <div>✓ Free Agent Account</div>
                <div>✓ Free Dashboard</div>
                <div>✓ Free Referral Tools</div>
                <div>✓ Earn $25 per completed artist setup</div>
                <div>✓ Give artists a referral discount</div>
                <div>✓ Track signups from your own dashboard</div>
                <div>✓ Share referral links and QR codes</div>
                <div>✓ Monitor pending and completed registrations</div>
                <div>✓ Build recurring revenue</div>
              </div>


              <div
                className="details"
                style={{
                  marginTop: 18
                }}
              >
                Referral links • QR codes • Agent dashboard • Commission tracking
              </div>


              <p
                style={{
                  marginTop: 18,
                  fontStyle:
                    "italic",
                  opacity: 0.9
                }}
              >
                Perfect for booking agents, talent buyers, artist managers,
                entertainment companies, and venue managers.
              </p>


              <p
                style={{
                  marginTop: 16,
                  fontWeight: 900,
                  fontSize:
                    "1.05rem"
                }}
              >
                💰 Refer 10 artists. Earn $250.
              </p>


              <p
                style={{
                  opacity: 0.9,
                  marginTop: 12
                }}
              >
                Free to join. No monthly fees.
              </p>


              <Link
                className="btn"
                href="/agents"
              >
                Request Agent Account
              </Link>


              <div
                className="actions"
                style={{
                  marginTop: 18
                }}
              >

                <Link
                  className="btn secondary"
                  href="/agents"
                >
                  Agent Login
                </Link>

              </div>

            </div>

          </div>

        </div>


        {/*******************************************************
         * HAPPY
         *******************************************************/}

        <div
          style={{
            textAlign:
              "center",
            marginTop: 40,
            marginBottom: 0,
          }}
        >

          <img
            src="/happy.png"
            alt="Happy"
            style={{
              width: "100%",
              maxWidth:
                "180px",
              height: "auto",
              margin:
                "0 auto",
              display:
                "block",
            }}
          />


          <div
            style={{
              textAlign:
                "center",
              marginTop: 8
            }}
          >

            <p
              style={{
                fontWeight: 700,
                color:
                  "#d4af37",
                marginBottom: 4,
              }}
            >
              🐾 Happy, Chief Happiness Officer
            </p>


            <p
              style={{
                fontSize: 14,
                opacity: 0.8,
                fontStyle:
                  "italic",
              }}
            >
              &quot;Powered by requests. Approved by Happy.&quot;
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}