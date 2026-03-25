
export default async function DashboardPage() {

    const res = await fetch('http://127.0.0.1:8000/api/providers/')
    const json = await res.json()
    console.log(json)


    return (
      <h1 className={`mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
    )
}
