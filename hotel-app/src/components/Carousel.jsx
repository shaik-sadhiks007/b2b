
function Carousel() {
    return (
        <div id="hotelCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner" style={{height : '80vh'}}>
                <div className="carousel-item active">
                    <img src="/img1.jpg" loading="lazy" className="d-block w-100" alt="Hotel 1" />
                </div>
                <div className="carousel-item">
                    <img src="/img2.jpg" loading="lazy" className="d-block w-100" alt="Hotel 2" />
                </div>
                <div className="carousel-item">
                    <img src="/img3.jpg" loading="lazy" className="d-block w-100" alt="Hotel 3" />
                </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#hotelCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#hotelCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon"></span>
            </button>
        </div>
    );
}

export default Carousel;
