// import "antd/dist/antd.css";
import {Menu, Select} from "antd";
import { Input } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { Typography, Row, Card } from "antd";

const { Title } = Typography;
const { Search } = Input;

const API_URL = "https://api.themoviedb.org/3/";
const API_KEY = "ef2e90a573ab53f756d86fbd452e6ad9";
const IMAGE_BASE_URL = "https://www.themoviedb.org/t/p/";
const IMAGE_SIZE = "w533_and_h300_bestv2";
const POSTER_SIZE = "w220_and_h330_face";

function GridCard({ image, movieId, movieName }) {
    return (
        <Card
            hoverable
            style={{ width: "30%", margin: "1.5%" }}
            cover={<img alt={movieName} src={image} />}
        >
            <Card.Meta title={movieName} />
        </Card>
    );
}

function Backdrop({ image, children }) {
    return (
        <div
            style={{
                width: "100vw",
                height: 150,
                backgroundImage: image ? `url(${image})` : undefined,
                backgroundColor: "lightgray",
                backgroundPosition: "center",
                backgroundSize: "cover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {children}
        </div>
    );
}

const SearchMenu = ({ mode, value, onChange }) => {
    return (
        <div className="searchMenu">
            <Menu mode={mode} />

            <Search
                value={value}
                placeholder="Search"
                allowClear
                style={{ width: 400 }}
                onChange={(e) => onChange(e.target.value)}
                size="large"
            />
        </div>
    );
};

function LandingPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("");
    const [counts, setCounts] = useState({
        total_pages: 500,
        total_results: 10000
    });
    const [error, setError] = useState(null);
    const [releaseYear, setReleaseYear] = useState(null);

    const hasNext = counts.total_pages > currentPage;

    const loadMoreItems = () => {
        if (hasNext) {
            setCurrentPage((page) => page + 1);
        }
    };

    const onChangeSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const onChangeSort = (event) => {
        const sortBy = event.target.value;
        setSortBy(sortBy);
    }

    const onChangeReleaseYear = (event) => {
        setReleaseYear(event.target.value);
    }

    useEffect(() => {
        const endpoint =
            searchTerm === ""
                ? `${API_URL}discover/movie?api_key=${API_KEY}&language=en-US&page=${currentPage}&sort_by=${sortBy}&primary_release_year=${releaseYear}`
                : `${API_URL}search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
                    searchTerm
                )}&page=${currentPage}`;

        setLoading(true);
        fetch(endpoint)
            .then((response) => response.json())
            .then((json) => {
                if (!json?.results) {
                    throw new Error(json?.statusMessage ?? "Error");
                }

                setMovies((previous) =>
                    currentPage === 1 ? json.results : [...previous, ...json.results]
                );
                setCounts({
                    total_pages: json.total_pages,
                    total_results: json.total_results
                });
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => setLoading(false));
    }, [searchTerm, currentPage, sortBy, releaseYear]);

    const handleScroll = () => {
        const windowHeight =
            "innerHeight" in window
                ? window.innerHeight
                : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight - 1) {
            loadMoreItems();
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div>
            <Backdrop
                image={
                    movies[0]
                        ? `${IMAGE_BASE_URL}${IMAGE_SIZE}${movies[0]?.backdrop_path}`
                        : undefined
                }
            >
                <SearchMenu
                    mode="horizontal"
                    value={searchTerm}
                    onChange={onChangeSearch}
                />
            </Backdrop>

            <div style={{ width: "100%", margin: "0" }}>
                <div style={{width: "85%", margin: "1rem auto"}}>
                    <Title level={2}>
                        {" "}
                        {searchTerm ? `Results for: ${searchTerm}` : "Latest movies"}
                    </Title>

                    <div style={{display: 'block', marginLeft: '20px'}}>
                        <span style={{fontWeight: 'bold', marginRight: '20px'}}>Sort</span>

                        <select  onChange={onChangeSort}>
                            <option value="">-</option>
                            <option value="popularity.desc">Popularity Desc</option>
                            <option value="primary_release_date.desc">Primary Release Date Desc</option>
                            <option value="primary_release_date.asc">Primary Release Date Asc</option>
                        </select>
                    </div>

                    <div style={{display: 'block', marginLeft: '20px'}}>
                        <span style={{fontWeight: 'bold', marginRight: '20px'}}>Filter</span>

                        Release Year: <input type="number" name="primary_release_year" onChange={onChangeReleaseYear}/>
                    </div>

                    <hr/>
                    <Row gutter={[16, 16]}>
                        {movies &&
                            movies.map((movie, index) => (
                                <React.Fragment key={index}>
                                <GridCard
                                        image={
                                            movie.poster_path
                                                ? `${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}`
                                                : null
                                        }
                                        movieId={movie.id}
                                        movieName={movie.original_title}
                                    />
                                </React.Fragment>
                            ))}
                    </Row>

                    {loading && <div>Loading...</div>}

                    <br/>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        {hasNext ? (
                            <button
                                className="loadMore"
                                onClick={loadMoreItems}
                                disabled={loading}
                            >
                                {error ? 'An error occurred!' : 'Load More'}
                            </button>
                        ) : (
                            <div>
                                Showing {counts.total_results} of {counts.total_results} Movies
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
