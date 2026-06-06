import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { bannerService } from "@/services/bannerService";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    bannerService
      .getPublic()
      .then((res) => setBanners(res.data.banners || []))
      .catch(() => setBanners([]));
  }, []);

  return (
    <div className="w-full h-[55vh] sm:h-[60vh] lg:h-[75vh] relative overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={banners.length > 1}
        className="h-full"
      >
        {banners.length > 0 ? (
          banners.map((b) => (
            <SwiperSlide key={b.id}>
              <div className="h-[55vh] sm:h-[60vh] lg:h-[75vh] w-full relative">
                <img
                  src={b.image_url}
                  alt="banner"
                  className="absolute w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="h-[55vh] sm:h-[60vh] lg:h-[75vh] bg-slate-900" />
          </SwiperSlide>
        )}
      </Swiper>

      {banners.length > 1 && (
        <>
          <button className="custom-prev absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full shadow-lg transition">
            <FaChevronLeft />
          </button>

          <button className="custom-next absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full shadow-lg transition">
            <FaChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default HeroSection;

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay } from "swiper/modules";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// const HeroSection = () => {
//   const navigate = useNavigate();
//   return (
//     <div className="w-full h-[55vh] sm:h-[60vh] lg:h-[75vh] relative overflow-hidden">

//       <Swiper
//         modules={[Navigation, Pagination, Autoplay]}
//         navigation={{
//           nextEl: ".custom-next",
//           prevEl: ".custom-prev",
//         }}
//         pagination={{ clickable: true }}
//         autoplay={{ delay: 3500, disableOnInteraction: false }}
//         loop={true}
//         className="h-full"
//       >

//         {/* SLIDE 1 */}
//         <SwiperSlide>
//           <div className="h-[55vh] sm:h-[60vh] lg:h-[75vh] w-full relative">

//             {/* BG IMAGE */}
//             <img
//               src="https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y291cnNlc3xlbnwwfHwwfHx8MA%3D%3D"
//               className="absolute w-full h-full object-cover"
//               alt="bg"
//             />

//             {/* OVERLAY */}
//             <div className="absolute inset-0 bg-black/60"></div>

//             {/* CONTENT */}
//             <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">

//               <div className="text-white max-w-sm sm:max-w-md lg:max-w-lg animate-fadeInUp">
//                 <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//                   Learn Skills That Matter 🚀
//                 </h1>

//                <p className="text-sm sm:text-base md:text-lg mb-5 opacity-90">
//                   Upgrade your career with real-world projects & mentorship
//                 </p>

//                 <button onClick={() => navigate("/homecourses")}
//                 className="bg-white text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold">
//                   Explore Courses
//                 </button>
//               </div>

//             </div>
//           </div>
//         </SwiperSlide>

//         {/* SLIDE 2 */}
//         <SwiperSlide>
//           <div className="h-[55vh] sm:h-[60vh] lg:h-[75vh] w-full relative">

//             <img
//               src="https://plus.unsplash.com/premium_photo-1733342678263-f53160dcd9e1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b25saW5lJTIwZWR1Y2F0aW9ufGVufDB8fDB8fHww"
//               className="absolute w-full h-full object-cover"
//               alt="bg2"
//             />

//             <div className="absolute inset-0 bg-black/60"></div>

//             <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">

//               <div className="text-white max-w-sm sm:max-w-md lg:max-w-lg animate-fadeInUp">
//                 <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
//                   Become Full Stack Developer 💻
//                 </h1>

//                 <p className="text-sm sm:text-base md:text-lg mb-5 opacity-90">
//                   React, Node, MongoDB with real-time projects
//                 </p>

//                 <button onClick={() => navigate("/homecourses")}
//                 className="bg-white text-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold">
//                   Start Learning
//                 </button>
//               </div>

//             </div>
//           </div>
//         </SwiperSlide>

//       </Swiper>

//       {/* 💎 GLASS ARROWS */}
//       <button className="custom-prev absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full shadow-lg transition">
//         <FaChevronLeft />
//       </button>

//       <button className="custom-next absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 md:p-4 rounded-full shadow-lg transition">
//         <FaChevronRight />
//       </button>

//     </div>
//   );
// };

// export default HeroSection;