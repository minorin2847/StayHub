import {
  FaCog,
  FaComments,
  FaFirstOrderAlt,
  FaHome,
  FaHotel,
  FaRestroom,
  FaUsers,
} from "react-icons/fa";
import { TiThMenuOutline } from "react-icons/ti";
import { IoMdPeople } from "react-icons/io";
import { LuHouse } from "react-icons/lu";
export const MENU_CONFIG = {
  ADMINISTRATOR: [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    {
      name: "Users",
      icon: FaUsers,
      path: "/dashboard/users",
      subItems: [
        { name: "All Users", path: "/dashboard/users" },
        { name: "User Roles", path: "/dashboard/roles" },
      ],
    },
    {
      name: "Rooms",
      icon: FaRestroom,
      path: "/dashboard/rooms",
      subItems: [
        { name: "View All Rooms", path: "/dashboard/rooms" },
        { name: "Add New Room", path: "/dashboard/rooms/add" },
        { name: "Room Types", path: "/dashboard/rooms/types" },
      ],
    },
    {
      name: "Hotels",
      icon: FaHotel,
      path: "/dashboard/hotels",
      subItems: [
        { name: "View All Hotels", path: "/dashboard/hotels" },
        { name: "Add New Hotel", path: "/dashboard/hotels/add" },
      ],
    },
    {
      name: "Branches",
      icon: FaHotel, // We can reuse FaHotel or another icon
      path: "/dashboard/branches",
      subItems: [
        { name: "View All Branches", path: "/dashboard/branches" }
      ],
    },
        {
      name: "Beds",
      icon: FaHotel, // We can reuse FaHotel or another icon
      path: "/dashboard/beds",
      subItems: [
        { name: "View All Beds", path: "/dashboard/beds" }
      ],
    },
    {
      name: "Front Desk",
      icon: FaCog, // Can change icon later
      path: "/dashboard/frontdesk",
    },
    {
      name: "Bookings",
      icon: FaFirstOrderAlt,
      path: "/dashboard/bookings",
    },
    {
      name: "Guests",
      icon: FaUsers,
      path: "/dashboard/guests",
    },
    { name: "Reviews", icon: FaComments, path: "/dashboard/reviews" },
  ],
  MANAGE_BRANCH: [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    {
      name: "Users",
      icon: FaUsers,
      path: "/dashboard/users",
      subItems: [{ name: "All Users", path: "/dashboard/users" }],
    },
    {
      name: "Hotels",
      icon: FaHotel,
      path: "/dashboard/hotels",
      // subitems for each hotel
      subItems: [
        { name: "Add Hotel", path: "/dashboard/hotels/" }
      ]
    },
  ],
  MANAGE_HOTEL: [
    { name: "Dashboard", icon: FaHome, path: "/dashboard" },
    {
      name: "Beds",
      icon: FaHotel, // change later
      path: "/dashboard/beds",
      subItems: [{ name: "Manage Beds", path: "/dashboard/beds" }],
    },
    {
      name: "Bookings",
      icon: FaHotel, 
      path: "/dashboard/bookings",
      subItems: [{ name: "All Bookings", path: "/dashboard/bookings"}],
    },
    {
      name: "Frontdesk",
      icon: TiThMenuOutline,
      path: "/dashboard/frontdesk",
      subItems: [{name: "All Frontdesk", path: "/dashboard/frontdesk"}],
    },
    {
      name: "Amenities",
      icon: FaHotel,
      path: "/dashboard/amenities",
      subItems: [{name: "All Amenities", path: "/dashboard/amenities"}],
    },
    {
      name: "Policies",
      icon: FaHotel,
      path: "/dashboard/policies",
      subItems: [{name: "All Policies", path: "/dashboard/policies"}],
    },
    {
      name: "Guests",
      icon: IoMdPeople,
      path: "/dashboard/guests",
    },
    {
      name: "Rooms",
      icon: LuHouse,
      path: "/dashboard/rooms",
    }
  ]
};
