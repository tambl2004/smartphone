export const NEWS_CATEGORIES = ['Tất cả', 'Công nghệ', 'Đánh giá', 'Mẹo & thủ thuật', 'So sánh', 'Tin tức'];

export const MOCK_NEWS = [
  {
    id: '1',
    slug: 'iphone-17-pro-lo-dien-thiet-ke-moi',
    category: 'Tin tức',
    title: 'iPhone 17 Pro lộ diện thiết kế hoàn toàn mới với camera periscope cải tiến',
    excerpt: 'Apple đang chuẩn bị ra mắt iPhone 17 Pro với những thay đổi táo bạo về thiết kế và hệ thống camera, dự kiến sẽ đặt ra tiêu chuẩn mới cho ngành smartphone cao cấp.',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=85',
    author: 'Minh Quân',
    authorAvatar: 'https://i.pravatar.cc/100?img=11',
    date: '24 tháng 5, 2026',
    readTime: '5 phút đọc',
    featured: true,
    content: [
      {
        type: 'lead',
        text: 'Những rò rỉ mới nhất cho thấy Apple đang chuẩn bị cho một bước nhảy vọt lớn với dòng iPhone 17 Pro, bao gồm thiết kế hoàn toàn mới, hệ thống camera đột phá và chip A19 Pro cực mạnh.',
      },
      {
        type: 'h2',
        text: 'Thiết kế mới: Mỏng hơn, cao cấp hơn',
      },
      {
        type: 'p',
        text: 'Theo các nguồn tin đáng tin cậy từ chuỗi cung ứng của Apple, iPhone 17 Pro sẽ có thân máy mỏng hơn đáng kể so với thế hệ trước. Apple được cho là đang thử nghiệm khung titan mới với kỹ thuật gia công tiên tiến, giúp giảm trọng lượng tổng thể trong khi vẫn đảm bảo độ bền.',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&q=80',
        caption: 'Concept thiết kế iPhone 17 Pro với khung titan mới',
      },
      {
        type: 'h2',
        text: 'Camera: Periscope thế hệ thứ hai',
      },
      {
        type: 'p',
        text: 'Hệ thống camera của iPhone 17 Pro sẽ nâng cấp lên cảm biến chính 200MP, kết hợp với lens periscope thế hệ mới có khả năng zoom quang học 10x. Camera selfie cũng được nâng cấp lên 24MP với khẩu độ lớn hơn, phù hợp cho điều kiện thiếu sáng.',
      },
      {
        type: 'p',
        text: 'Đặc biệt, Apple được cho là đang tích hợp tính năng quay video 8K và các tính năng AI tiên tiến để cải thiện chất lượng ảnh và video trong thời gian thực, cạnh tranh trực tiếp với Google Pixel 9 Pro.',
      },
      {
        type: 'h2',
        text: 'Chip A19 Pro và thời lượng pin',
      },
      {
        type: 'p',
        text: 'Chip A19 Pro mới dự kiến sẽ được sản xuất trên tiến trình 2nm, mang lại hiệu suất vượt trội và hiệu quả năng lượng tốt hơn. Điều này kết hợp với pin dung lượng lớn hơn hứa hẹn thời lượng sử dụng cả ngày dài ngay cả với tác vụ nặng.',
      },
    ],
    relatedSlugs: ['samsung-galaxy-s25-ultra-review', 'so-sanh-pixel-9-vs-iphone-16'],
  },
  {
    id: '2',
    slug: 'samsung-galaxy-s25-ultra-review',
    category: 'Đánh giá',
    title: 'Đánh giá Samsung Galaxy S25 Ultra: Flagship đáng mua nhất 2026',
    excerpt: 'Sau hơn 2 tuần sử dụng thực tế, đây là những gì chúng tôi nghĩ về siêu phẩm mới nhất của Samsung — từ hiệu năng đến trải nghiệm camera.',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&q=85',
    author: 'Thanh Hà',
    authorAvatar: 'https://i.pravatar.cc/100?img=5',
    date: '22 tháng 5, 2026',
    readTime: '8 phút đọc',
    featured: false,
    content: [
      {
        type: 'lead',
        text: 'Galaxy S25 Ultra là smartphone Android đỉnh cao nhất từ trước đến nay của Samsung — nhưng liệu nó có xứng đáng với mức giá 30 triệu đồng không?',
      },
      {
        type: 'h2',
        text: 'Thiết kế và màn hình',
      },
      {
        type: 'p',
        text: 'Samsung đã tinh chỉnh thiết kế của S25 Ultra theo hướng góc cạnh hơn, trưởng thành hơn. Màn hình Dynamic AMOLED 2X 6.9 inch với độ phân giải QHD+ và tần số làm tươi 120Hz thích ứng vẫn là một trong những tấm nền đẹp nhất trên thị trường.',
      },
      {
        type: 'h2',
        text: 'Hiệu năng và AI',
      },
      {
        type: 'p',
        text: 'Chip Snapdragon 8 Elite mới nhất kết hợp với Galaxy AI được nâng cấp đáng kể. Các tính năng AI như Dịch thuật thời gian thực, tóm tắt cuộc họp và chỉnh sửa ảnh thông minh hoạt động ấn tượng và thực sự hữu ích trong cuộc sống hàng ngày.',
      },
    ],
    relatedSlugs: ['iphone-17-pro-lo-dien-thiet-ke-moi', 'so-sanh-pixel-9-vs-iphone-16'],
  },
  {
    id: '3',
    slug: 'meo-tang-toc-pin-iphone',
    category: 'Mẹo & thủ thuật',
    title: '7 mẹo đơn giản giúp pin iPhone của bạn dùng được cả ngày dài',
    excerpt: 'Pin iPhone luôn là nỗi lo của nhiều người. Áp dụng ngay 7 mẹo này để kéo dài tuổi thọ pin mà không cần mua phụ kiện thêm.',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=85',
    author: 'Hồng Nhung',
    authorAvatar: 'https://i.pravatar.cc/100?img=9',
    date: '20 tháng 5, 2026',
    readTime: '4 phút đọc',
    featured: false,
    content: [
      {
        type: 'lead',
        text: 'Pin iPhone luôn là nỗi lo của nhiều người. Với 7 mẹo đơn giản dưới đây, bạn có thể kéo dài đáng kể thời gian sử dụng mỗi lần sạc.',
      },
      {
        type: 'h2',
        text: '1. Bật chế độ tiết kiệm pin thông minh',
      },
      {
        type: 'p',
        text: 'Thay vì chờ đến khi pin xuống 20% mới bật chế độ Low Power Mode, hãy bật nó ngay từ đầu ngày khi bạn biết sẽ không có cơ hội sạc. Điều này giảm đáng kể mức tiêu thụ của các tác vụ nền.',
      },
    ],
    relatedSlugs: ['chon-tai-nghe-bluetooth-cho-iphone', 'samsung-galaxy-s25-ultra-review'],
  },
  {
    id: '4',
    slug: 'so-sanh-pixel-9-vs-iphone-16',
    category: 'So sánh',
    title: 'Google Pixel 9 Pro vs iPhone 16 Pro: Cuộc chiến camera AI 2026',
    excerpt: 'Khi Google và Apple đều đẩy mạnh AI vào camera, đâu mới là lựa chọn tốt nhất cho người yêu nhiếp ảnh di động? Chúng tôi so sánh toàn diện.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=85',
    author: 'Văn Khoa',
    authorAvatar: 'https://i.pravatar.cc/100?img=3',
    date: '18 tháng 5, 2026',
    readTime: '10 phút đọc',
    featured: false,
    content: [
      {
        type: 'lead',
        text: 'Cuộc chiến camera AI giữa Google và Apple ngày càng trở nên khốc liệt. Chúng tôi đã dành hai tuần để so sánh toàn diện hai flagship này.',
      },
    ],
    relatedSlugs: ['iphone-17-pro-lo-dien-thiet-ke-moi', 'samsung-galaxy-s25-ultra-review'],
  },
  {
    id: '5',
    slug: 'xu-huong-man-hinh-gap-2026',
    category: 'Công nghệ',
    title: 'Màn hình gập 2026: Từ concept đến sản phẩm thực tế đáng dùng',
    excerpt: 'Sau nhiều năm phát triển, điện thoại gập đã trưởng thành đáng kể. Cùng điểm qua những cải tiến nổi bật và xu hướng thiết kế đang định hình tương lai.',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&q=85',
    author: 'Quỳnh Anh',
    authorAvatar: 'https://i.pravatar.cc/100?img=47',
    date: '15 tháng 5, 2026',
    readTime: '6 phút đọc',
    featured: false,
    content: [
      {
        type: 'lead',
        text: 'Điện thoại gập đã đi một chặng đường dài từ những chiếc máy mỏng manh, đắt tiền đến những sản phẩm thực sự đáng dùng hàng ngày.',
      },
    ],
    relatedSlugs: ['samsung-galaxy-s25-ultra-review', 'iphone-17-pro-lo-dien-thiet-ke-moi'],
  },
  {
    id: '6',
    slug: 'chon-tai-nghe-bluetooth-cho-iphone',
    category: 'Mẹo & thủ thuật',
    title: 'Cách chọn tai nghe Bluetooth phù hợp với nhu cầu và ngân sách của bạn',
    excerpt: 'Thị trường tai nghe Bluetooth ngày càng đa dạng, khiến việc lựa chọn trở nên khó khăn. Hướng dẫn chi tiết giúp bạn tìm được chiếc tai nghe ưng ý nhất.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85',
    author: 'Minh Quân',
    authorAvatar: 'https://i.pravatar.cc/100?img=11',
    date: '12 tháng 5, 2026',
    readTime: '5 phút đọc',
    featured: false,
    content: [
      {
        type: 'lead',
        text: 'Với hàng trăm lựa chọn tai nghe Bluetooth trên thị trường, chọn được chiếc phù hợp là thách thức thực sự. Hướng dẫn này giúp bạn thu hẹp lựa chọn.',
      },
    ],
    relatedSlugs: ['meo-tang-toc-pin-iphone', 'samsung-galaxy-s25-ultra-review'],
  },
];
