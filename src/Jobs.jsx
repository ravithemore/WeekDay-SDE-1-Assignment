import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Grid,
    CircularProgress,
    Skeleton,
    ToggleButtonGroup,
    ToggleButton,
    Slider
} from '@mui/material';

const URL = "https://api.weekday.technology/adhoc/getSampleJdJSON";

export const Jobs = () => {
    const [jobdata, setJobdata] = useState([]);
    const [displayedCards, setDisplayedCards] = useState(10);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [minExperience, setMinExperience] = useState(0);
    const [maxExperience, setMaxExperience] = useState(10);

    const fetchApi = async () => {
        setLoading(true);
        try {
            const resp = await axios.post(URL, {
                limit: displayedCards,
                offset: offset
            });
            const result = await resp.data.jdList;
            setJobdata(prevData => [...prevData, ...result]);
            setOffset(offset => offset + 10);
        } catch (error) {
            console.log(error, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // api call here wwith filter as dependency
        fetchApi();
    }, [filter]);

    useEffect(() => {
        // for infinte scroll
        const handleScroll = () => {
            const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                fetchApi();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleApply = (link) => {
        // to open link externally
        window.open(`${link}`, '_blank');
    };

    const handleJobFilterChange = (event, newFilter) => {
        setJobdata([]);
        setOffset(0);
        setFilter(newFilter);
    };

    const handleExperienceChange = (event, newValue) => {
        setMinExperience(newValue[0]);
        setMaxExperience(newValue[1]);
    };

    const filteredData = jobdata.filter(item => {
        if (filter === 'remote') {
            return item.location === 'remote';
        } else if (filter === 'onsite') {
            return item.location !== 'remote';
        }
        return true;
    }).filter(item => {
        const minExp = item.minExp || 0;
        const maxExp = item.maxExp || 10;
        return minExp >= minExperience && maxExp <= maxExperience;
    });

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                {/* Location Filter */}
                <div style={{ marginRight: '2rem' }}>
                    <Typography variant="body2" color="text.secondary">
                        Location:
                    </Typography>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={handleJobFilterChange}
                        aria-label="text alignment"
                        style={{ marginTop: '0.5rem' }}
                    >
                        <ToggleButton value="all" aria-label="left aligned">
                            All
                        </ToggleButton>
                        <ToggleButton value="remote" aria-label="centered">
                            Remote
                        </ToggleButton>
                        <ToggleButton value="onsite" aria-label="right aligned">
                            Onsite
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>

                {/* Experience Filter */}
                <div>
                    <Typography variant="body2" color="text.secondary">
                        Experience:
                    </Typography>
                    <Slider
                        value={[minExperience, maxExperience]}
                        onChange={handleExperienceChange}
                        min={0}
                        max={20}
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        style={{ margin: '0.5rem 0', maxWidth: '500px' }}
                    />
                </div>
            </div>
            {/* Job Cards */}
            <Grid container spacing={3}>
                {loading ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Skeleton variant="rectangular" width="100%" height={200} />
                        </Grid>
                    ))
                ) : (
                    filteredData.map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Card elevation={5} style={{ borderRadius: "10px", border: "1px solid #ccc" }}>
                                <CardContent>
                                    <div>
                                        <Typography variant="h7" component="span" style={{ fontWeight: "bold" }} >
                                            Job Role:
                                        </Typography>
                                        <Typography variant="h7" component="span">
                                            {`${item.jobRole.charAt(0).toUpperCase()}${item.jobRole.slice(1)}`}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h7" component="span" style={{ fontWeight: "bold" }}>
                                            Location:
                                        </Typography>
                                        <Typography variant="h7" component="span">
                                            {item.location}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h7" component="span" style={{ fontWeight: "bold" }}>
                                            Experience:
                                        </Typography>
                                        <Typography variant="h7" component="span">
                                            {item.minExp === null || item.maxExp === null ? "NA" : ` ${item.minExp}-${item.maxExp}Years`}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h7" component="span" style={{ fontWeight: "bold" }}>
                                            Salary:
                                        </Typography>
                                        <Typography variant="h7" component="span">
                                            {item.minJdSalary === null || item.maxJdSalary === null ? "NA" : ` ${item.minJdSalary}-${item.maxJdSalary} ${item.salaryCurrencyCode}`}
                                        </Typography>
                                    </div>
                                    <div>
                                        <Typography variant="h7" component="span" style={{ fontWeight: "bold" }}>
                                            Job Details:
                                        </Typography>
                                        <Typography variant="body2" style={{ maxHeight: '150px', overflowY: 'auto' }} color="text.secondary">
                                            {item.jobDetailsFromCompany}
                                        </Typography>
                                    </div>
                                </CardContent>
                                <CardActions>
                                    <Button className="primary" variant="contained" color="primary" size="medium" onClick={() => handleApply(item.jdLink)}> Apply</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
            {loading && <CircularProgress style={{ margin: '1rem auto', display: 'block' }} />}
        </>
    );
};
