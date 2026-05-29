import React from "react";
import { Carousel } from 'react-bootstrap';
import './home.css';
type Product = {
  name: string;
  price: number;
};
function Home () {
    const data : Product[] = [{name:'Galaxy A55', price: 300},{name:'Iphone', price:1000}, {name:'Vinfast VF3', price:15000}];
    return (
        <div>
          <Carousel>
            <Carousel.Item>
              <img
                className="d-block w-100 carousel-img"
                src="/images/da_nang1.jpg"
                alt="First slide"
              />
              <Carousel.Caption>
                <h3>Welcome to My Website</h3>
                <p>Clean • Modern • Responsive</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 carousel-img"
                src="/images/da_nang2.jpg"
                alt="First slide"
              />
              <Carousel.Caption>
                <h3>Da Nang</h3>
                <p>Have a nice day.</p>
              </Carousel.Caption>
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100 carousel-img"
                src="/images/ha_long1.jpg"
                alt="First slide"
              />
              <Carousel.Caption>
                <h3>Ha Long</h3>
                <p>My country</p>
              </Carousel.Caption>
            </Carousel.Item>
          </Carousel>
          <h1 style={{textAlign:"center"}}> Home page </h1>
        </div>
    )
}

export default Home;