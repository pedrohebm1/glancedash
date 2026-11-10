import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf8fb',
  },
  scrollView: {
    flex: 1,
  },
  
  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#5856d6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  /* Welcome Banner */
  welcomeBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerBackgroundCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 160,
    height: 160,
    backgroundColor: 'rgba(88, 86, 214, 0.05)',
    borderRadius: 80,
  },
  dateText: {
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    fontFamily: 'Manrope_Regular',
  },
  workspaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  badgeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#5856d6',
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#334155',
    fontWeight: '500',
  },
  bannerButton: {
    position: 'absolute',
    right: 32,
    bottom: 32,
    width: 48,
    height: 48,
    backgroundColor: '#5856d6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5856d6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Recent Section */
  sectionContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    fontFamily: 'Manrope_Bold'
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#5856d6',
    fontWeight: '600',
    marginRight: 4,
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  recentCard: {
    width: 288,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    marginBottom: 1,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardDescription: {
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto'
  },
  timeTag: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeTagText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  todoList: {
    gap: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    marginLeft: 12,
    color: '#475569',
  },
  todoTextCompleted: {
    marginLeft: 12,
    color: '#475569',
    textDecorationLine: 'line-through',
  },

  /* Workspaces Section */
  workspacesSection: {
    marginTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  workspaceList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    gap: 10,
  },

  /* Floating Action Button */
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: '#5856d6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5856d6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },

  /* Bottom Navigation */
  navItem: {
    alignItems: 'center',
  },
  navItemDisabled: {
    alignItems: 'center',
    opacity: 0.4,
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5856d6',
    marginTop: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
});

export default styles