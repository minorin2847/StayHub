"use client";
import { useState } from "react";
import HotelTitle from "@/components/hotels/content/HotelTitle";
import HotelNavBar from "@/components/hotels/content/HotelNavBar";
import HotelDescription from "@/components/hotels/content/HotelDescription";
import Location from "@/components/content/Location";
import Calendar from "@/components/content/Calendar";
import Review from "@/types";
import { Hotel } from "@/types/hotel";
import RoomDescription from "@/components/rooms/content/RoomDescription";
import HotelAmenities from "@/components/hotels/content/HotelAmenities";
import Policies from "@/components/content/Policies";
import HotelReviews from "@/components/hotels/content/HotelReviews";
import Overview from "@/components/content/Overview";

export default function HotelPage() {
  const sections = ["Overview", "Amenities", "Location", "Calendar", "Reviews"];
  const [HotelData, setHotelData] = useState<Hotel>({
    name: "La Siesta Ha Noi",
    location: "Ha Noi, Viet Nam",
    description:
      "Welcome to my fully refurbished 17 m² studio, ideally located in Versailles, only a 10-minute walk to the Palace of Versailles and a 5-minute walk to the Rive Gauche train station.It consists of a living room open to a fully equipped kitchen (dishwasher, microwave, Nespresso machine,...) bed in mezzanine",
    rooms: 200,
    floors: 6,
    classification: 10,
    amenities: Array(10)
      .fill(0)
      .map((_, index) => {
        return {
          name: `Home ${index}`,
          icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjA4LDMySDQ4QTE2LDE2LDAsMCwwLDMyLDQ4VjIwOGExNiwxNiwwLDAsMCwxNiwxNkgyMDhhMTYsMTYsMCwwLDAsMTYtMTZWNDhBMTYsMTYsMCwwLDAsMjA4LDMyWm0wLDE3Nkg0OFY0OEgyMDhWMjA4Wk03Miw3NkExMiwxMiwwLDEsMSw4NCw4OCwxMiwxMiwwLDAsMSw3Miw3NlptNDQsMGExMiwxMiwwLDEsMSwxMiwxMkExMiwxMiwwLDAsMSwxMTYsNzZabTQ0LDBhMTIsMTIsMCwxLDEsMTIsMTJBMTIsMTIsMCwwLDEsMTYwLDc2Wm0yNCwyOEg3MmE4LDgsMCwwLDAtOCw4djcyYTgsOCwwLDAsMCw4LDhIMTg0YTgsOCwwLDAsMCw4LThWMTEyQTgsOCwwLDAsMCwxODQsMTA0Wm0tOCw3Mkg4MFYxMjBoOTZaIj48L3BhdGg+PC9zdmc+",
          category: "hotel_services",
        };
      }),
    policies: Array(10)
      .fill(0)
      .map((_, index) => {
        return {
          name: `No bobux ${index}`,
          icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHJvbGU9ImltZyIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMTguOTI2IDIzLjk5OCAwIDE4Ljg5MiA1LjA3NS4wMDIgMjQgNS4xMDhaTTE1LjM0OCAxMC4wOWwtNS4yODItMS40NTMtMS40MTQgNS4yNzMgNS4yODIgMS40NTN6Ij48L3BhdGg+PC9zdmc+",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sagittis neque vitae turpis tempor, eget facilisis libero tempor. Phasellus nisl velit, porta quis metus eu, laoreet mattis nulla. Curabitur feugiat sapien sit amet ligula tincidunt, in feugiat sapien consequat. Quisque pharetra massa lacus, ut sollicitudin erat dictum at. Aenean ligula risus, pulvinar a eros sed, dictum semper ligula. Nunc porta aliquet mattis. Ut vitae hendrerit orci.",
        };
      }),
  });
  const [reviewData, setReviewData] = useState<Review[]>(
    Array(100)
      .fill(0)
      .map((_, index) => {
        return {
          id: index,
          userid: 1,
          roomid: 1,
          created_at: Date.now(),
          rating: [
            {
              category: "Amenities",
              icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAxNiAxNiIgaGVpZ2h0PSIyMDBweCIgd2lkdGg9IjIwMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZTogY3VycmVudENvbG9yOyIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1zdHJva2U9IiI+PHBhdGggZD0iTTggNi45ODJDOS42NjQgNS4zMDkgMTMuODI1IDguMjM2IDggMTIgMi4xNzUgOC4yMzYgNi4zMzYgNS4zMDkgOCA2Ljk4MiI+PC9wYXRoPjxwYXRoIGQ9Ik04LjcwNyAxLjVhMSAxIDAgMCAwLTEuNDE0IDBMLjY0NiA4LjE0NmEuNS41IDAgMCAwIC43MDguNzA3TDIgOC4yMDdWMTMuNUExLjUgMS41IDAgMCAwIDMuNSAxNWg5YTEuNSAxLjUgMCAwIDAgMS41LTEuNVY4LjIwN2wuNjQ2LjY0NmEuNS41IDAgMCAwIC43MDgtLjcwN0wxMyA1Ljc5M1YyLjVhLjUuNSAwIDAgMC0uNS0uNWgtMWEuNS41IDAgMCAwLS41LjV2MS4yOTN6TTEzIDcuMjA3VjEzLjVhLjUuNSAwIDAgMS0uNS41aC05YS41LjUgMCAwIDEtLjUtLjVWNy4yMDdsNS01eiI+PC9wYXRoPjwvc3ZnPg==",
              rating: Math.floor(Math.random() * 5) + 1,
            },
            {
              category: "Cleanliness",
              icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBkPSJNMjAwLDgwYTgsOCwwLDAsMCw4LTgsNTYuMDYsNTYuMDYsMCwwLDAtNTYtNTZIODBBMTYsMTYsMCwwLDAsNjQsMzJWODBhMjQsMjQsMCwwLDEtMjQsMjQsOCw4LDAsMCwwLDAsMTZBNDAsNDAsMCwwLDAsODAsODBoMzJ2MjQuNjJhMjMuODcsMjMuODcsMCwwLDEtOSwxOC43NEw4NywxMzYuMTVhMzkuNzksMzkuNzksMCwwLDAtMTUsMzEuMjNWMjI0YTE2LDE2LDAsMCwwLDE2LDE2SDE5MmExNiwxNiwwLDAsMCwxNi0xNlYyMTEuNDdBMjcwLjg4LDI3MC44OCwwLDAsMCwxNzQsODBaTTgwLDMyaDcyYTQwLjA4LDQwLjA4LDAsMCwxLDM5LjIsMzJIODBaTTE5MiwyMTEuNDdWMjI0SDg4VjE2Ny4zOGEyMy44NywyMy44NywwLDAsMSw5LTE4Ljc0bDE2LTEyLjc5YTM5Ljc5LDM5Ljc5LDAsMCwwLDE1LTMxLjIzVjgwaDI3LjUyQTI1NC44NiwyNTQuODYsMCwwLDEsMTkyLDIxMS40N1oiPjwvcGF0aD48L3N2Zz4=",
              rating: Math.floor(Math.random() * 5) + 1,
            },
            {
              category: "Communication",
              icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIgZD0iTTQzMSAzMjAuNmMtMS0zLjYgMS4yLTguNiAzLjMtMTIuMmEzMy42OCAzMy42OCAwIDAgMSAyLjEtMy4xQTE2MiAxNjIgMCAwIDAgNDY0IDIxNWMuMy05Mi4yLTc3LjUtMTY3LTE3My43LTE2Ny04My45IDAtMTUzLjkgNTcuMS0xNzAuMyAxMzIuOWExNjAuNyAxNjAuNyAwIDAgMC0zLjcgMzQuMmMwIDkyLjMgNzQuOCAxNjkuMSAxNzEgMTY5LjEgMTUuMyAwIDM1LjktNC42IDQ3LjItNy43czIyLjUtNy4yIDI1LjQtOC4zYTI2LjQ0IDI2LjQ0IDAgMCAxIDkuMy0xLjcgMjYgMjYgMCAwIDEgMTAuMSAybDU2LjcgMjAuMWExMy41MiAxMy41MiAwIDAgMCAzLjkgMSA4IDggMCAwIDAgOC04IDEyLjg1IDEyLjg1IDAgMCAwLS41LTIuN3oiPjwvcGF0aD48cGF0aCBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIzMiIgZD0iTTY2LjQ2IDIzMmExNDYuMjMgMTQ2LjIzIDAgMCAwIDYuMzkgMTUyLjY3YzIuMzEgMy40OSAzLjYxIDYuMTkgMy4yMSA4cy0xMS45MyA2MS44Ny0xMS45MyA2MS44N2E4IDggMCAwIDAgMi43MSA3LjY4QTguMTcgOC4xNyAwIDAgMCA3MiA0NjRhNy4yNiA3LjI2IDAgMCAwIDIuOTEtLjZsNTYuMjEtMjJhMTUuNyAxNS43IDAgMCAxIDEyIC4yYzE4Ljk0IDcuMzggMzkuODggMTIgNjAuODMgMTJBMTU5LjIxIDE1OS4yMSAwIDAgMCAyODQgNDMyLjExIj48L3BhdGg+PC9zdmc+",
              rating: Math.floor(Math.random() * 5) + 1,
            },
            {
              category: "Location",
              icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3R5bGU9Ii0tZGFya3JlYWRlci1pbmxpbmUtc3Ryb2tlOiBjdXJyZW50Q29sb3I7IiBkYXRhLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZT0iIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNy42NTcgMTYuNjU3TDEzLjQxNCAyMC45YTEuOTk4IDEuOTk4IDAgMDEtMi44MjcgMGwtNC4yNDQtNC4yNDNhOCA4IDAgMTExMS4zMTQgMHoiPjwvcGF0aD48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNSAxMWEzIDMgMCAxMS02IDAgMyAzIDAgMDE2IDB6Ij48L3BhdGg+PC9zdmc+",
              rating: Math.floor(Math.random() * 5) + 1,
            },
            {
              category: "Value",
              icon: "data:image/svg+xml;base64,PHN2ZyBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgaGVpZ2h0PSIyMDBweCIgd2lkdGg9IjIwMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSItLWRhcmtyZWFkZXItaW5saW5lLXN0cm9rZTogY3VycmVudENvbG9yOyIgZGF0YS1kYXJrcmVhZGVyLWlubGluZS1zdHJva2U9IiI+PGcgaWQ9IkJhZGdlX0RvbGxhciI+PGc+PHBhdGggZD0iTTEyLDIxLjk1M2MtLjg5NSwwLTEuNTQ1LS43NDMtMi4xMTgtMS40YTMuNjcxLDMuNjcxLDAsMCwwLTEuMDMzLS45NDYsMy44LDMuOCwwLDAsMC0xLjQ2Ni0uMDc3LDMuMDEyLDMuMDEyLDAsMCwxLTIuNDIxLS40OTQsMy4wMTQsMy4wMTQsMCwwLDEtLjQ5NC0yLjQyMSwzLjgyLDMuODIsMCwwLDAtLjA3Ny0xLjQ2NiwzLjY3MSwzLjY3MSwwLDAsMC0uOTQ2LTEuMDMzYy0uNjU1LS41NzMtMS40LTEuMjIyLTEuNC0yLjExOHMuNzQzLTEuNTQ1LDEuNC0yLjExOGEzLjY2LDMuNjYsMCwwLDAsLjk0Ni0xLjAzNCwzLjgxNSwzLjgxNSwwLDAsMCwuMDc3LTEuNDY1LDMuMDEyLDMuMDEyLDAsMCwxLC40OTQtMi40MjEsMy4wMTUsMy4wMTUsMCwwLDEsMi40MjItLjVBMy43OTQsMy43OTQsMCwwLDAsOC44NDksNC4zOWEzLjY2NiwzLjY2NiwwLDAsMCwxLjAzMy0uOTQ1Yy41NzMtLjY1NSwxLjIyMy0xLjQsMi4xMTgtMS40czEuNTQ1Ljc0MiwyLjExOCwxLjRhMy42NiwzLjY2LDAsMCwwLDEuMDM0Ljk0NiwzLjgwNywzLjgwNywwLDAsMCwxLjQ2NC4wNzcsMy4wMTgsMy4wMTgsMCwwLDEsMi40MjIuNSwzLjAxMiwzLjAxMiwwLDAsMSwuNSwyLjQyMiwzLjgxLDMuODEsMCwwLDAsLjA3NywxLjQ2NCwzLjY2LDMuNjYsMCwwLDAsLjk0NiwxLjAzNGMuNjU1LjU3MywxLjQsMS4yMjMsMS40LDIuMTE4cy0uNzQzLDEuNTQ1LTEuNCwyLjExOGEzLjY2NiwzLjY2NiwwLDAsMC0uOTQ1LDEuMDMzLDMuODE1LDMuODE1LDAsMCwwLS4wNzcsMS40NjUsMy4wMTIsMy4wMTIsMCwwLDEtLjUsMi40MjIsMy4wMTgsMy4wMTgsMCwwLDEtMi40MjEuNDk0LDMuODE4LDMuODE4LDAsMCwwLTEuNDY1LjA3NywzLjY3MywzLjY3MywwLDAsMC0xLjAzNC45NDZDMTMuNTQ1LDIxLjIxLDEyLjksMjEuOTUzLDEyLDIxLjk1M1pNOC4wOTMsMTguNWEyLjk1MiwyLjk1MiwwLDAsMSwxLjEzOC4xODMsNC4yMzMsNC4yMzMsMCwwLDEsMS40LDEuMjFjLjQ1NC41Mi45MjQsMS4wNTcsMS4zNjUsMS4wNTdzLjkxMS0uNTM3LDEuMzY2LTEuMDU3YTQuMjI1LDQuMjI1LDAsMCwxLDEuNC0xLjIxLDQuMzY1LDQuMzY1LDAsMCwxLDEuOTA4LS4xNTJjLjY3Mi4wNDEsMS4zNjYuMDg1LDEuNjUzLS4ycy4yNDUtLjk4Mi4yLTEuNjUzYTQuMzg3LDQuMzg3LDAsMCwxLC4xNTItMS45MDksNC4yNDEsNC4yNDEsMCwwLDEsMS4yMDktMS40Yy41Mi0uNDU0LDEuMDU3LS45MjQsMS4wNTctMS4zNjVzLS41MzctLjkxMS0xLjA1Ny0xLjM2NWE0LjIzNCw0LjIzNCwwLDAsMS0xLjIwOS0xLjQsNC4zODEsNC4zODEsMCwwLDEtLjE1Mi0xLjkwOGMuMDQxLS42NzEuMDg0LTEuMzY1LS4yLTEuNjUzcy0uOTgyLS4yNDYtMS42NTMtLjJhNC4zODQsNC4zODQsMCwwLDEtMS45MDgtLjE1Miw0LjIzNCw0LjIzNCwwLDAsMS0xLjQtMS4yMDljLS40NTQtLjUyLS45MjQtMS4wNTctMS4zNjUtMS4wNTdzLS45MTEuNTM3LTEuMzY1LDEuMDU3YTQuMjQxLDQuMjQxLDAsMCwxLTEuNCwxLjIwOSw0LjQxNyw0LjQxNywwLDAsMS0xLjkwOS4xNTJjLS42Ny0uMDQxLTEuMzY0LS4wODQtMS42NTMuMnMtLjI0NC45ODEtLjIsMS42NTJBNC4zNyw0LjM3LDAsMCwxLDUuMzE0LDkuMjNhNC4yMjYsNC4yMjYsMCwwLDEtMS4yMSwxLjRjLS41Mi40NTQtMS4wNTcuOTI1LTEuMDU3LDEuMzY1cy41MzcuOTExLDEuMDU3LDEuMzY2YTQuMjM4LDQuMjM4LDAsMCwxLDEuMjEsMS40LDQuMzc4LDQuMzc4LDAsMCwxLC4xNTIsMS45MWMtLjA0MS42NzItLjA4NCwxLjM2Ni4yLDEuNjUzcy45OC4yNDUsMS42NTMuMkM3LjU3OCwxOC41MTksNy44MzgsMTguNSw4LjA5MywxOC41WiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNC41LDEzLjVhMi4wMDYsMi4wMDYsMCwwLDEtMiwydjEuMDFBLjUuNSwwLDAsMSwxMiwxN2EuNDkyLjQ5MiwwLDAsMS0uNS0uNDlWMTUuNWgtMS4yNWEuNS41LDAsMCwxLS41LS41LjUuNSwwLDAsMSwuNS0uNUgxMi41YTEsMSwwLDEsMCwwLTJoLTFhMiwyLDAsMCwxLDAtNFY3LjQ1M0EuNDczLjQ3MywwLDAsMSwxMiw3YS40OC40OCwwLDAsMSwuNS40NVY4LjVoMS4yNWEuNS41LDAsMCwxLC41LjUuNTA4LjUwOCwwLDAsMS0uNS41SDExLjVhMSwxLDAsMCwwLDAsMmgxQTIsMiwwLDAsMSwxNC41LDEzLjVaIj48L3BhdGg+PC9nPjwvZz48L3N2Zz4=",
              rating: Math.floor(Math.random() * 5) + 1,
            },
          ],
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
          pros: "Pros",
          cons: "Cons",
          like_count: 3636,
          response: "Response",
        };
      }),
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  return (
    <div className="flex flex-col border-3 px-[104px]">
      <HotelTitle hotelData={HotelData} />
      <HotelNavBar sections={sections} />
      <Overview />
      <div className="flex flex-col w-[1000px] h-fit gap-y-[40px]">
        <HotelDescription Hoteldata={HotelData} />
        <HotelAmenities hotelData={HotelData} />
        <Location />
        <Calendar />
      </div>
      <HotelReviews reviewData={reviewData} />
      <Policies hotelData={HotelData} />
    </div>
  );
}
