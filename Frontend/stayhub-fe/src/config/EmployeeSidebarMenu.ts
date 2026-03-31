import { FaCog, FaComments, FaFirstOrderAlt, FaHome, FaHotel, FaRestroom, FaUsers } from "react-icons/fa";

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
              { name: "View All Branches", path: "/dashboard/branches" },
              { name: "Add New Branch", path: "/dashboard/branches/add" },
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
    "MANAGE_BRANCH": [
                {
            name: "Users",
            icon: FaUsers,
            path: "/dashboard/users",
            subItems: [
              { name: "All Users", path: "/dashboard/users" },
            ],
          },
    ]
}