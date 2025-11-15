export default function AnnouncementCard({ ann }) {
  return (
    <div className="p-5 bg-white rounded-xl shadow border">
      <h3 className="text-xl font-semibold">{ann.title}</h3>
      <p className="text-gray-700 mt-2">{ann.body}</p>

      <p className="text-gray-400 text-sm mt-3">
        {new Date(ann.created_at).toLocaleString()}
      </p>
    </div>
  );
}
